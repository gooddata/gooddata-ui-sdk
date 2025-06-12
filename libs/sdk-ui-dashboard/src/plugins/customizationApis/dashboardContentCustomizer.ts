// (C) 2023 GoodData Corporation
import { IDashboardContentCustomizer } from "../customizer.js";
import {
    DashboardContentComponentProvider,
    OptionalDashboardContentComponentProvider,
    DefaultDashboardMainContent,
} from "../../presentation/index.js";
import { InvariantError } from "ts-invariant";
import union from "lodash/union.js";
import { IDashboardCustomizationLogger } from "./customizationLogging.js";
import { CustomizerMutationsContext } from "./types.js";

const DefaultDashboardContentComponentProvider: DashboardContentComponentProvider = () => {
    return DefaultDashboardMainContent;
};

interface IDashboardContentCustomizerState {
    addCustomProvider(provider: OptionalDashboardContentComponentProvider): void;
    getRootProvider(): DashboardContentComponentProvider;
    switchRootProvider(provider: DashboardContentComponentProvider): void;
}

class DefaultDashboardContentCustomizerState implements IDashboardContentCustomizerState {
    /*
     * Chain of 'core' providers. Core providers are evaluated from last to first. As soon as some provider
     * returns a Component, then that component will be used for rendering. If provider returns undefined,
     * the evaluation continues to next provider in the chain.
     *
     * Note: the chain is 'primed' with a provider that always returns the default insight component. This is
     * essential to allow the decorations to work - purely because decorations can only work if there is
     * something to decorate. See constructor.
     */
    private readonly coreProviderChain: DashboardContentComponentProvider[];

    /*
     * Core provider encapsulates resolution using the chain of core providers.
     */
    private readonly coreProvider: DashboardContentComponentProvider = (dashboard) => {
        const providerStack = [...this.coreProviderChain].reverse();

        for (const provider of providerStack) {
            const Component = provider(dashboard);

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
    private rootProvider: DashboardContentComponentProvider = this.coreProvider;

    constructor(defaultProvider: DashboardContentComponentProvider) {
        this.coreProviderChain = [defaultProvider];
    }

    addCustomProvider(provider: DashboardContentComponentProvider): void {
        this.coreProviderChain.push(provider);
    }

    getRootProvider(): DashboardContentComponentProvider {
        return this.rootProvider;
    }

    switchRootProvider(provider: DashboardContentComponentProvider): void {
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
class SealedDashboardContentCustomizerState implements IDashboardContentCustomizerState {
    constructor(
        private readonly logger: IDashboardCustomizationLogger,
        private readonly state: IDashboardContentCustomizerState,
    ) {}

    public addCustomProvider = (): void => {
        // eslint-disable-next-line no-console
        this.logger.warn(
            `Attempting to customize dashboard content rendering outside of plugin registration. Ignoring.`,
        );
    };

    // eslint-disable-next-line sonarjs/no-identical-functions
    public switchRootProvider = (): void => {
        // eslint-disable-next-line no-console
        this.logger.warn(
            `Attempting to customize dashboard content rendering outside of plugin registration. Ignoring.`,
        );
    };

    public getRootProvider = (): DashboardContentComponentProvider => {
        return this.state.getRootProvider();
    };
}

/**
 * Default implementation of the insight rendering customizer. Notice that the state of the customizations
 * is kept separate from this class.
 *
 * This code is responsible for creation of the providers (if needed) and then updating the state
 * accordingly. The customizer state methods are responsible for doing correct updates of the state itself. This
 * decoupling is in place so that it is possible to seal the state and prevent write operations from some point
 * onward. See {@link SealedInsightCustomizerState} for more motivation behind this.
 *
 * @internal
 */
export class DefaultDashboardContentCustomizer implements IDashboardContentCustomizer {
    private readonly logger: IDashboardCustomizationLogger;
    private readonly mutationContext: CustomizerMutationsContext;
    private state: IDashboardContentCustomizerState;

    constructor(
        logger: IDashboardCustomizationLogger,
        mutationContext: CustomizerMutationsContext,
        defaultProvider: DashboardContentComponentProvider = DefaultDashboardContentComponentProvider,
    ) {
        this.logger = logger;
        this.mutationContext = mutationContext;
        this.state = new DefaultDashboardContentCustomizerState(defaultProvider);
    }

    public withCustomDecorator = (
        providerFactory: (
            next: DashboardContentComponentProvider,
        ) => OptionalDashboardContentComponentProvider,
    ): this => {
        // snapshot current root provider
        const rootSnapshot = this.state.getRootProvider();
        // call user's factory in order to obtain the actual provider - pass the current root so that user's
        // code can use it to obtain component to decorate
        const decoratorProvider = providerFactory(rootSnapshot);
        // construct new root provider; this will be using user's provider with a fallback to root provider
        // in case user's code does not return anything
        const newRootProvider: DashboardContentComponentProvider = (dashboard) => {
            const Component = decoratorProvider(dashboard);

            if (Component) {
                return Component;
            }

            return rootSnapshot(dashboard);
        };

        // finally modify the root provider; next time someone registers decorator, it will be on top of
        // this currently registered one
        this.state.switchRootProvider(newRootProvider);
        this.mutationContext.dashboardContent = union(this.mutationContext.dashboardContent, ["decorator"]);

        return this;
    };

    public getDashboardContentProvider = (): DashboardContentComponentProvider => {
        return this.state.getRootProvider();
    };

    public sealCustomizer = (): void => {
        this.state = new SealedDashboardContentCustomizerState(this.logger, this.state);
    };
}
