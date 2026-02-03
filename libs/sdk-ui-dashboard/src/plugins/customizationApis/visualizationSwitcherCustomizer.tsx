// (C) 2021-2026 GoodData Corporation

import { union } from "lodash-es";
import { InvariantError } from "ts-invariant";

import { type IDashboardCustomizationLogger } from "./customizationLogging.js";
import { type CustomizerMutationsContext } from "./types.js";
import type {
    OptionalVisualizationSwitcherComponentProvider,
    OptionalVisualizationSwitcherToolbarComponentProvider,
    VisualizationSwitcherComponentProvider,
    VisualizationSwitcherToolbarComponentProvider,
} from "../../presentation/dashboardContexts/types.js";
import { DefaultVisualizationSwitcherToolbar } from "../../presentation/widget/visualizationSwitcher/configuration/DefaultVisualizationSwitcherToolbar.js";
import { DefaultDashboardVisualizationSwitcher } from "../../presentation/widget/visualizationSwitcher/DefaultDashboardVisualizationSwitcher.js";
import { type IVisualizationSwitcherCustomizer } from "../customizer.js";

const DefaultVisualizationSwitcherRendererProvider: VisualizationSwitcherComponentProvider = () => {
    return DefaultDashboardVisualizationSwitcher;
};

const DefaultVisualizationSwitcherToolbarRendererProvider: VisualizationSwitcherToolbarComponentProvider =
    () => {
        return DefaultVisualizationSwitcherToolbar;
    };

interface IVisualizationSwitcherCustomizerState {
    addCustomProvider(provider: OptionalVisualizationSwitcherComponentProvider): void;
    getRootProvider(): VisualizationSwitcherComponentProvider;
    switchRootProvider(provider: VisualizationSwitcherComponentProvider): void;
}

interface IVisualizationSwitcherToolbarCustomizerState {
    addCustomProvider(provider: OptionalVisualizationSwitcherToolbarComponentProvider): void;
    getRootProvider(): VisualizationSwitcherToolbarComponentProvider;
    switchRootProvider(provider: VisualizationSwitcherToolbarComponentProvider): void;
}

class DefaultVisualizationSwitcherCustomizerState implements IVisualizationSwitcherCustomizerState {
    /*
     * Chain of 'core' providers. Core providers are evaluated from last to first. As soon as some provider
     * returns a Component, then that component will be used for rendering. If provider returns undefined,
     * the evaluation continues to next provider in the chain.
     *
     * Note: the chain is 'primed' with a provider that always returns the default DateFilter renderer. This is
     * essential to allow the decorations to work - purely because decorations can only work if there is
     * something to decorate. See constructor.
     */
    private readonly coreProviderChain: VisualizationSwitcherComponentProvider[];

    /*
     * Core provider encapsulates resolution using the chain of core providers.
     */
    private readonly coreProvider: VisualizationSwitcherComponentProvider = (topBar) => {
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
    private rootProvider: VisualizationSwitcherComponentProvider = this.coreProvider;

    constructor(defaultProvider: VisualizationSwitcherComponentProvider) {
        this.coreProviderChain = [defaultProvider];
    }

    addCustomProvider(provider: VisualizationSwitcherComponentProvider): void {
        this.coreProviderChain.push(provider);
    }

    getRootProvider(): VisualizationSwitcherComponentProvider {
        return this.rootProvider;
    }

    switchRootProvider(provider: VisualizationSwitcherComponentProvider): void {
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
class SealedVisualizationSwitcherCustomizerState implements IVisualizationSwitcherCustomizerState {
    constructor(
        private readonly logger: IDashboardCustomizationLogger,
        private readonly state: IVisualizationSwitcherCustomizerState,
    ) {}

    public addCustomProvider = (_provider: VisualizationSwitcherComponentProvider): void => {
        this.logger.warn(
            `Attempting to customize VisualizationSwitcher rendering outside of plugin registration. Ignoring.`,
        );
    };

    public switchRootProvider = (_provider: VisualizationSwitcherComponentProvider): void => {
        this.logger.warn(
            `Attempting to customize VisualizationSwitcher rendering outside of plugin registration. Ignoring.`,
        );
    };

    public getRootProvider = (): VisualizationSwitcherComponentProvider => {
        return this.state.getRootProvider();
    };
}

class DefaultVisualizationSwitcherToolbarCustomizerState implements IVisualizationSwitcherToolbarCustomizerState {
    /*
     * Chain of 'core' providers. Core providers are evaluated from last to first. As soon as some provider
     * returns a Component, then that component will be used for rendering. If provider returns undefined,
     * the evaluation continues to next provider in the chain.
     *
     * Note: the chain is 'primed' with a provider that always returns the default DateFilter renderer. This is
     * essential to allow the decorations to work - purely because decorations can only work if there is
     * something to decorate. See constructor.
     */
    private readonly coreProviderChain: VisualizationSwitcherToolbarComponentProvider[];

    /*
     * Core provider encapsulates resolution using the chain of core providers.
     */
    private readonly coreProvider: VisualizationSwitcherToolbarComponentProvider = (topBar) => {
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
    private rootProvider: VisualizationSwitcherToolbarComponentProvider = this.coreProvider;

    constructor(defaultProvider: VisualizationSwitcherToolbarComponentProvider) {
        this.coreProviderChain = [defaultProvider];
    }

    addCustomProvider(provider: VisualizationSwitcherToolbarComponentProvider): void {
        this.coreProviderChain.push(provider);
    }

    getRootProvider(): VisualizationSwitcherToolbarComponentProvider {
        return this.rootProvider;
    }

    switchRootProvider(provider: VisualizationSwitcherToolbarComponentProvider): void {
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
class SealedVisualizationSwitcherToolbarCustomizerState implements IVisualizationSwitcherToolbarCustomizerState {
    constructor(
        private readonly logger: IDashboardCustomizationLogger,
        private readonly state: IVisualizationSwitcherToolbarCustomizerState,
    ) {}

    public addCustomProvider = (_provider: VisualizationSwitcherToolbarComponentProvider): void => {
        this.logger.warn(
            `Attempting to customize VisualizationSwitcher rendering outside of plugin registration. Ignoring.`,
        );
    };

    public switchRootProvider = (_provider: VisualizationSwitcherToolbarComponentProvider): void => {
        this.logger.warn(
            `Attempting to customize VisualizationSwitcher rendering outside of plugin registration. Ignoring.`,
        );
    };

    public getRootProvider = (): VisualizationSwitcherToolbarComponentProvider => {
        return this.state.getRootProvider();
    };
}

/**
 * Default implementation of the VisualizationSwitcher rendering customizer. Notice that the state of the customizations
 * is kept separate from this class.
 *
 * This code is responsible for creation of the providers (if needed) and then updating the state
 * accordingly. The customizer state methods are responsible for doing correct updates of the state itself. This
 * decoupling is in place so that it is possible to seal the state and prevent write operations from some point
 * onward. See {@link SealedVisualizationSwitcherCustomizerState} for more motivation behind this.
 *
 * @internal
 */
export class DefaultVisualizationSwitcherCustomizer implements IVisualizationSwitcherCustomizer {
    private readonly logger: IDashboardCustomizationLogger;
    private readonly mutationContext: CustomizerMutationsContext;
    private switcherState: IVisualizationSwitcherCustomizerState;
    private toolbarState: IVisualizationSwitcherToolbarCustomizerState;

    constructor(
        logger: IDashboardCustomizationLogger,
        mutationContext: CustomizerMutationsContext,
        defaultSwitcherProvider: VisualizationSwitcherComponentProvider = DefaultVisualizationSwitcherRendererProvider,
        defaultToolbarProvider: VisualizationSwitcherToolbarComponentProvider = DefaultVisualizationSwitcherToolbarRendererProvider,
    ) {
        this.logger = logger;
        this.mutationContext = mutationContext;
        this.switcherState = new DefaultVisualizationSwitcherCustomizerState(defaultSwitcherProvider);
        this.toolbarState = new DefaultVisualizationSwitcherToolbarCustomizerState(defaultToolbarProvider);
    }

    public withCustomSwitcherProvider = (
        provider: OptionalVisualizationSwitcherComponentProvider,
    ): IVisualizationSwitcherCustomizer => {
        this.switcherState.addCustomProvider(provider);
        this.mutationContext.visualizationSwitcher = union(this.mutationContext.visualizationSwitcher, [
            "provider",
        ]);

        return this;
    };

    public withCustomSwitcherDecorator(
        providerFactory: (
            next: VisualizationSwitcherComponentProvider,
        ) => OptionalVisualizationSwitcherComponentProvider,
    ): IVisualizationSwitcherCustomizer {
        // snapshot current root provider
        const rootSnapshot = this.switcherState.getRootProvider();
        // call user's factory in order to obtain the actual provider - pass the current root so that user's
        // code can use it to obtain component to decorate
        const decoratorProvider = providerFactory(rootSnapshot);
        // construct new root provider; this will be using user's provider with a fallback to root provider
        // in case user's code does not return anything
        const newRootProvider: VisualizationSwitcherComponentProvider = (props) => {
            const Component = decoratorProvider(props);

            if (Component) {
                return Component;
            }

            return rootSnapshot(props);
        };

        // finally modify the root provider; next time someone registers decorator, it will be on top of
        // this currently registered one
        this.switcherState.switchRootProvider(newRootProvider);
        this.mutationContext.visualizationSwitcher = union(this.mutationContext.visualizationSwitcher, [
            "decorator",
        ]);

        return this;
    }

    public withCustomToolbarProvider = (
        provider: OptionalVisualizationSwitcherToolbarComponentProvider,
    ): IVisualizationSwitcherCustomizer => {
        this.toolbarState.addCustomProvider(provider);
        this.mutationContext.visualizationSwitcherToolbar = union(
            this.mutationContext.visualizationSwitcherToolbar,
            ["provider"],
        );

        return this;
    };

    public withCustomToolbarDecorator(
        providerFactory: (
            next: VisualizationSwitcherToolbarComponentProvider,
        ) => OptionalVisualizationSwitcherToolbarComponentProvider,
    ): IVisualizationSwitcherCustomizer {
        // snapshot current root provider
        const rootSnapshot = this.toolbarState.getRootProvider();
        // call user's factory in order to obtain the actual provider - pass the current root so that user's
        // code can use it to obtain component to decorate
        const decoratorProvider = providerFactory(rootSnapshot);
        // construct new root provider; this will be using user's provider with a fallback to root provider
        // in case user's code does not return anything
        // eslint-disable-next-line sonarjs/no-identical-functions
        const newRootProvider: VisualizationSwitcherToolbarComponentProvider = (props) => {
            const Component = decoratorProvider(props);

            if (Component) {
                return Component;
            }

            return rootSnapshot(props);
        };

        // finally modify the root provider; next time someone registers decorator, it will be on top of
        // this currently registered one
        this.toolbarState.switchRootProvider(newRootProvider);
        this.mutationContext.visualizationSwitcherToolbar = union(
            this.mutationContext.visualizationSwitcherToolbar,
            ["decorator"],
        );

        return this;
    }

    public getVisualizationSwitcherComponentProvider = (): OptionalVisualizationSwitcherComponentProvider => {
        return this.switcherState.getRootProvider();
    };

    public getVisualizationSwitcherToolbarComponentProvider =
        (): OptionalVisualizationSwitcherToolbarComponentProvider => {
            return this.toolbarState.getRootProvider();
        };

    public sealCustomizer = (): void => {
        this.switcherState = new SealedVisualizationSwitcherCustomizerState(this.logger, this.switcherState);
        this.toolbarState = new SealedVisualizationSwitcherToolbarCustomizerState(
            this.logger,
            this.toolbarState,
        );
    };
}
