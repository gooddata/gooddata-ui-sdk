// (C) 2021-2026 GoodData Corporation

import { union } from "lodash-es";
import { InvariantError } from "ts-invariant";

import { type IDashboardCustomizationLogger } from "./customizationLogging.js";
import { type CustomizerMutationsContext } from "./types.js";
import {
    type OptionalTopBarComponentProvider,
    type TopBarComponentProvider,
} from "../../presentation/dashboardContexts/types.js";
import { RenderModeAwareTopBar } from "../../presentation/topBar/topBar/RenderModeAwareTopBar.js";
import { type CustomTopBarComponent } from "../../presentation/topBar/topBar/types.js";
import { type ITopBarCustomizer } from "../customizer.js";

const DefaultTopBarRendererProvider: TopBarComponentProvider = () => {
    return RenderModeAwareTopBar;
};

interface ITopBarCustomizerState {
    addCustomProvider(provider: OptionalTopBarComponentProvider): void;
    getRootProvider(): TopBarComponentProvider;
    switchRootProvider(provider: TopBarComponentProvider): void;
}

interface ITopBarCustomizerResult {
    TopBarComponent: CustomTopBarComponent | undefined;
}

class DefaultTopBarCustomizerState implements ITopBarCustomizerState {
    /*
     * Chain of 'core' providers. Core providers are evaluated from last to first. As soon as some provider
     * returns a Component, then that component will be used for rendering. If provider returns undefined,
     * the evaluation continues to next provider in the chain.
     *
     * Note: the chain is 'primed' with a provider that always returns the default DateFilter renderer. This is
     * essential to allow the decorations to work - purely because decorations can only work if there is
     * something to decorate. See constructor.
     */
    private readonly coreProviderChain: TopBarComponentProvider[];

    /*
     * Core provider encapsulates resolution using the chain of core providers.
     */
    private readonly coreProvider: TopBarComponentProvider = (topBar) => {
        const providerStack = [...this.coreProviderChain].reverse();

        for (const provider of providerStack) {
            const Component = provider(topBar);

            if (Component) {
                return Component;
            }
        }

        // if this happens then the provider chain got messed up. by default the chain contains the default
        // provider which never returns undefined
        throw new InvariantError();
    };

    /*
     * Root provider is THE provider that should be used in the dashboard extension properties. The
     * provider function included here will reflect the setup where there may be N registered decorators
     * sitting on top of a chain of core providers.
     *
     * In the initial state the root provider IS the core provider - meaning no decorations. As the
     * decorators get registered, the rootProvider changes.
     */
    private rootProvider: TopBarComponentProvider = this.coreProvider;

    constructor(defaultProvider: TopBarComponentProvider) {
        this.coreProviderChain = [defaultProvider];
    }

    addCustomProvider(provider: TopBarComponentProvider): void {
        this.coreProviderChain.push(provider);
    }

    getRootProvider(): TopBarComponentProvider {
        return this.rootProvider;
    }

    switchRootProvider(provider: TopBarComponentProvider): void {
        this.rootProvider = provider;
    }
}

/**
 * Sealed customizer state will not allow to perform any modifications of the state. Sealing the state
 * is essential to make the customization more defensive: during the registration, the plugin can hang
 * onto the dashboard customizer - stash it somewhere. And then after registration try to use the customizer
 * and try to do additional 'ad-hoc' customizations.
 *
 * Such a thing is not supported by the lifecycle and this sealing is in place to prevent plugins going into
 * that dangerous territory.
 */
class SealedTopBarCustomizerState implements ITopBarCustomizerState {
    constructor(
        private readonly logger: IDashboardCustomizationLogger,
        private readonly state: ITopBarCustomizerState,
    ) {}

    public addCustomProvider = (_provider: TopBarComponentProvider): void => {
        this.logger.warn(
            `Attempting to customize TopBar rendering outside of plugin registration. Ignoring.`,
        );
    };

    public switchRootProvider = (_provider: TopBarComponentProvider): void => {
        this.logger.warn(
            `Attempting to customize TopBar rendering outside of plugin registration. Ignoring.`,
        );
    };

    public getRootProvider = (): TopBarComponentProvider => {
        return this.state.getRootProvider();
    };
}

/**
 * Default implementation of the TopBar rendering customizer. Notice that the state of the customizations
 * is kept separate from this class.
 *
 * This code is responsible for creation of the providers (if needed) and then updating the state
 * accordingly. The customizer state methods are responsible for doing correct updates of the state itself. This
 * decoupling is in place so that it is possible to seal the state and prevent write operations from some point
 * onward. See {@link SealedTopBarCustomizerState} for more motivation behind this.
 *
 * @internal
 */
export class DefaultTopBarCustomizer implements ITopBarCustomizer {
    private readonly logger: IDashboardCustomizationLogger;
    private readonly mutationContext: CustomizerMutationsContext;
    private state: ITopBarCustomizerState;
    private updated = false;

    constructor(
        logger: IDashboardCustomizationLogger,
        mutationContext: CustomizerMutationsContext,
        defaultProvider: TopBarComponentProvider = DefaultTopBarRendererProvider,
    ) {
        this.logger = logger;
        this.mutationContext = mutationContext;
        this.state = new DefaultTopBarCustomizerState(defaultProvider);
    }

    public withCustomProvider = (provider: OptionalTopBarComponentProvider): ITopBarCustomizer => {
        this.state.addCustomProvider(provider);
        this.mutationContext.topBar = union(this.mutationContext.topBar, ["provider"]);
        this.updated = true;

        return this;
    };

    public withCustomDecorator(
        providerFactory: (next: TopBarComponentProvider) => OptionalTopBarComponentProvider,
    ): ITopBarCustomizer {
        // snapshot current root provider
        const rootSnapshot = this.state.getRootProvider();
        // call user's factory in order to obtain the actual provider - pass the current root so that user's
        // code can use it to obtain component to decorate
        const decoratorProvider = providerFactory(rootSnapshot);
        // construct new root provider; this will be using user's provider with a fallback to root provider
        // in case user's code does not return anything
        const newRootProvider: TopBarComponentProvider = (props) => {
            const Component = decoratorProvider(props);

            if (Component) {
                return Component;
            }

            return rootSnapshot(props);
        };

        // finally modify the root provider; next time someone registers decorator, it will be on top of
        // this currently registered one
        this.state.switchRootProvider(newRootProvider);
        this.mutationContext.topBar = union(this.mutationContext.topBar, ["decorator"]);
        this.updated = true;

        return this;
    }

    getCustomizerResult = (): ITopBarCustomizerResult => {
        return {
            TopBarComponent: this.updated
                ? (props) => {
                      const Comp = this.state.getRootProvider()(props);
                      return <Comp {...props} />;
                  }
                : undefined,
        };
    };

    public sealCustomizer = (): void => {
        this.state = new SealedTopBarCustomizerState(this.logger, this.state);
    };
}
