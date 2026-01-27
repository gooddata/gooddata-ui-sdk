// (C) 2021-2026 GoodData Corporation

import { InvariantError } from "ts-invariant";

import { type IDashboardCustomizationLogger } from "./customizationLogging.js";
import type {
    FilterGroupComponentProvider,
    OptionalFilterGroupComponentProvider,
} from "../../presentation/dashboardContexts/types.js";
import { DefaultDashboardFilterGroup } from "../../presentation/filterBar/filterBar/DefaultDashboardFilterGroup.js";
import { type IFilterGroupsCustomizer } from "../customizer.js";

const DefaultFilterGroupRendererProvider: FilterGroupComponentProvider = () => {
    return DefaultDashboardFilterGroup;
};

interface IFilterGroupsCustomizerState {
    addCustomProvider(provider: OptionalFilterGroupComponentProvider): void;
    getRootProvider(): FilterGroupComponentProvider;
    switchRootProvider(provider: FilterGroupComponentProvider): void;
}

class DefaultFilterGroupsCustomizerState implements IFilterGroupsCustomizerState {
    /*
     * Chain of 'core' providers. Core providers are evaluated from last to first. As soon as some provider
     * returns a Component, then that component will be used for rendering. If provider returns undefined,
     * the evaluation continues to next provider in the chain.
     *
     * Note: the chain is 'primed' with a provider that always returns the default FilterGroup renderer. This is
     * essential to allow the decorations to work - purely because decorations can only work if there is
     * something to decorate. See constructor.
     */
    private readonly coreProviderChain: FilterGroupComponentProvider[];

    /*
     * Core provider encapsulates resolution using the chain of core providers.
     */
    private readonly coreProvider: FilterGroupComponentProvider = (filterGroup) => {
        const providerStack = [...this.coreProviderChain].reverse();

        for (const provider of providerStack) {
            const Component = provider(filterGroup);

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
    private rootProvider: FilterGroupComponentProvider = this.coreProvider;

    constructor(defaultProvider: FilterGroupComponentProvider) {
        this.coreProviderChain = [defaultProvider];
    }

    addCustomProvider(provider: FilterGroupComponentProvider): void {
        this.coreProviderChain.push(provider);
    }

    getRootProvider(): FilterGroupComponentProvider {
        return this.rootProvider;
    }

    switchRootProvider(provider: FilterGroupComponentProvider): void {
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
class SealedFilterGroupsCustomizerState implements IFilterGroupsCustomizerState {
    constructor(
        private readonly logger: IDashboardCustomizationLogger,
        private readonly state: IFilterGroupsCustomizerState,
    ) {}

    public addCustomProvider = (_provider: FilterGroupComponentProvider): void => {
        this.logger.warn(
            `Attempting to customize FilterGroup rendering outside of plugin registration. Ignoring.`,
        );
    };

    public switchRootProvider = (_provider: FilterGroupComponentProvider): void => {
        this.logger.warn(
            `Attempting to customize FilterGroup rendering outside of plugin registration. Ignoring.`,
        );
    };

    public getRootProvider = (): FilterGroupComponentProvider => {
        return this.state.getRootProvider();
    };
}

/**
 * Default implementation of the FilterGroup rendering customizer. Notice that the state of the customizations
 * is kept separate from this class.
 *
 * This code is responsible for creation of the providers (if needed) and then updating the state
 * accordingly. The customizer state methods are responsible for doing correct updates of the state itself. This
 * decoupling is in place so that it is possible to seal the state and prevent write operations from some point
 * onward. See {@link SealedFilterGroupCustomizerState} for more motivation behind this.
 *
 * @internal
 */
export class DefaultFilterGroupsCustomizer implements IFilterGroupsCustomizer {
    private readonly logger: IDashboardCustomizationLogger;
    private state: IFilterGroupsCustomizerState;

    constructor(
        logger: IDashboardCustomizationLogger,
        defaultProvider: FilterGroupComponentProvider = DefaultFilterGroupRendererProvider,
    ) {
        this.logger = logger;
        this.state = new DefaultFilterGroupsCustomizerState(defaultProvider);
    }

    public withCustomProvider = (provider: OptionalFilterGroupComponentProvider): this => {
        this.state.addCustomProvider(provider);
        return this;
    };

    public getFilterGroupProvider = (): FilterGroupComponentProvider => {
        return this.state.getRootProvider();
    };

    public sealCustomizer = (): void => {
        this.state = new SealedFilterGroupsCustomizerState(this.logger, this.state);
    };
}
