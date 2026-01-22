// (C) 2021-2026 GoodData Corporation

import { union } from "lodash-es";
import { InvariantError } from "ts-invariant";

import { type IDashboardCustomizationLogger } from "./customizationLogging.js";
import { type CustomizerMutationsContext } from "./types.js";
import {
    type OptionalTitleComponentProvider,
    type TitleComponentProvider,
} from "../../presentation/dashboardContexts/types.js";
import { RenderModeAwareTitle } from "../../presentation/topBar/title/RenderModeAwareTitle.js";
import { type CustomTitleComponent } from "../../presentation/topBar/title/types.js";
import { type ITitleCustomizer } from "../customizer.js";

const DefaultTitleRendererProvider: TitleComponentProvider = () => {
    return RenderModeAwareTitle;
};

interface ITitleCustomizerState {
    addCustomProvider(provider: OptionalTitleComponentProvider): void;
    getRootProvider(): TitleComponentProvider;
    switchRootProvider(provider: TitleComponentProvider): void;
}

interface ITitleCustomizerResult {
    TitleComponent: CustomTitleComponent | undefined;
}

class DefaultTitleCustomizerState implements ITitleCustomizerState {
    /*
     * Chain of 'core' providers. Core providers are evaluated from last to first. As soon as some provider
     * returns a Component, then that component will be used for rendering. If provider returns undefined,
     * the evaluation continues to next provider in the chain.
     *
     * Note: the chain is 'primed' with a provider that always returns the default DateFilter renderer. This is
     * essential to allow the decorations to work - purely because decorations can only work if there is
     * something to decorate. See constructor.
     */
    private readonly coreProviderChain: TitleComponentProvider[];

    /*
     * Core provider encapsulates resolution using the chain of core providers.
     */
    private readonly coreProvider: TitleComponentProvider = (topBar) => {
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
    private rootProvider: TitleComponentProvider = this.coreProvider;

    constructor(defaultProvider: TitleComponentProvider) {
        this.coreProviderChain = [defaultProvider];
    }

    addCustomProvider(provider: TitleComponentProvider): void {
        this.coreProviderChain.push(provider);
    }

    getRootProvider(): TitleComponentProvider {
        return this.rootProvider;
    }

    switchRootProvider(provider: TitleComponentProvider): void {
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
class SealedTitleCustomizerState implements ITitleCustomizerState {
    constructor(
        private readonly logger: IDashboardCustomizationLogger,
        private readonly state: ITitleCustomizerState,
    ) {}

    public addCustomProvider = (_provider: TitleComponentProvider): void => {
        this.logger.warn(`Attempting to customize Title rendering outside of plugin registration. Ignoring.`);
    };

    public switchRootProvider = (_provider: TitleComponentProvider): void => {
        this.logger.warn(`Attempting to customize Title rendering outside of plugin registration. Ignoring.`);
    };

    public getRootProvider = (): TitleComponentProvider => {
        return this.state.getRootProvider();
    };
}

/**
 * Default implementation of the Title rendering customizer. Notice that the state of the customizations
 * is kept separate from this class.
 *
 * This code is responsible for creation of the providers (if needed) and then updating the state
 * accordingly. The customizer state methods are responsible for doing correct updates of the state itself. This
 * decoupling is in place so that it is possible to seal the state and prevent write operations from some point
 * onward. See {@link SealedTitleCustomizerState} for more motivation behind this.
 *
 * @internal
 */
export class DefaultTitleCustomizer implements ITitleCustomizer {
    private readonly logger: IDashboardCustomizationLogger;
    private readonly mutationContext: CustomizerMutationsContext;
    private state: ITitleCustomizerState;
    private updated = false;

    constructor(
        logger: IDashboardCustomizationLogger,
        mutationContext: CustomizerMutationsContext,
        defaultProvider: TitleComponentProvider = DefaultTitleRendererProvider,
    ) {
        this.logger = logger;
        this.mutationContext = mutationContext;
        this.state = new DefaultTitleCustomizerState(defaultProvider);
    }

    public withCustomProvider = (provider: OptionalTitleComponentProvider): ITitleCustomizer => {
        this.state.addCustomProvider(provider);
        this.mutationContext.title = union(this.mutationContext.title, ["provider"]);
        this.updated = true;

        return this;
    };

    public withCustomDecorator(
        providerFactory: (next: TitleComponentProvider) => OptionalTitleComponentProvider,
    ): ITitleCustomizer {
        // snapshot current root provider
        const rootSnapshot = this.state.getRootProvider();
        // call user's factory in order to obtain the actual provider - pass the current root so that user's
        // code can use it to obtain component to decorate
        const decoratorProvider = providerFactory(rootSnapshot);
        // construct new root provider; this will be using user's provider with a fallback to root provider
        // in case user's code does not return anything
        const newRootProvider: TitleComponentProvider = (props) => {
            const Component = decoratorProvider(props);

            if (Component) {
                return Component;
            }

            return rootSnapshot(props);
        };

        // finally modify the root provider; next time someone registers decorator, it will be on top of
        // this currently registered one
        this.state.switchRootProvider(newRootProvider);
        this.mutationContext.title = union(this.mutationContext.title, ["decorator"]);
        this.updated = true;

        return this;
    }

    getCustomizerResult = (): ITitleCustomizerResult => {
        return {
            TitleComponent: this.updated
                ? (props) => {
                      const Comp = this.state.getRootProvider()(props);
                      return <Comp {...props} />;
                  }
                : undefined,
        };
    };

    public sealCustomizer = (): void => {
        this.state = new SealedTitleCustomizerState(this.logger, this.state);
    };
}
