// (C) 2021-2022 GoodData Corporation
import { IDateFiltersCustomizer } from "../customizer.js";
import {
    DateFilterComponentProvider,
    DefaultDashboardDateFilter,
    OptionalDateFilterComponentProvider,
} from "../../presentation/index.js";
import { InvariantError } from "ts-invariant";
import { IDashboardCustomizationLogger } from "./customizationLogging.js";

const DefaultDateFilterRendererProvider: DateFilterComponentProvider = () => {
    return DefaultDashboardDateFilter;
};

interface IDateFiltersCustomizerState {
    addCustomProvider(provider: OptionalDateFilterComponentProvider): void;
    getRootProvider(): DateFilterComponentProvider;
    switchRootProvider(provider: DateFilterComponentProvider): void;
}

class DefaultDateFiltersCustomizerState implements IDateFiltersCustomizerState {
    /*
     * Chain of 'core' providers. Core providers are evaluated from last to first. As soon as some provider
     * returns a Component, then that component will be used for rendering. If provider returns undefined,
     * the evaluation continues to next provider in the chain.
     *
     * Note: the chain is 'primed' with a provider that always returns the default DateFilter renderer. This is
     * essential to allow the decorations to work - purely because decorations can only work if there is
     * something to decorate. See constructor.
     */
    private readonly coreProviderChain: DateFilterComponentProvider[];

    /*
     * Core provider encapsulates resolution using the chain of core providers.
     */
    private readonly coreProvider: DateFilterComponentProvider = (dateFilter) => {
        const providerStack = [...this.coreProviderChain].reverse();

        for (const provider of providerStack) {
            const Component = provider(dateFilter);

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
    private rootProvider: DateFilterComponentProvider = this.coreProvider;

    constructor(defaultProvider: DateFilterComponentProvider) {
        this.coreProviderChain = [defaultProvider];
    }

    addCustomProvider(provider: DateFilterComponentProvider): void {
        this.coreProviderChain.push(provider);
    }

    getRootProvider(): DateFilterComponentProvider {
        return this.rootProvider;
    }

    switchRootProvider(provider: DateFilterComponentProvider): void {
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
class SealedDateFiltersCustomizerState implements IDateFiltersCustomizerState {
    constructor(
        private readonly logger: IDashboardCustomizationLogger,
        private readonly state: IDateFiltersCustomizerState,
    ) {}

    public addCustomProvider = (_provider: DateFilterComponentProvider): void => {
        // eslint-disable-next-line no-console
        this.logger.warn(
            `Attempting to customize DateFilter rendering outside of plugin registration. Ignoring.`,
        );
    };

    // eslint-disable-next-line sonarjs/no-identical-functions
    public switchRootProvider = (_provider: DateFilterComponentProvider): void => {
        // eslint-disable-next-line no-console
        this.logger.warn(
            `Attempting to customize DateFilter rendering outside of plugin registration. Ignoring.`,
        );
    };

    public getRootProvider = (): DateFilterComponentProvider => {
        return this.state.getRootProvider();
    };
}

/**
 * Default implementation of the DateFilter rendering customizer. Notice that the state of the customizations
 * is kept separate from this class.
 *
 * This code is responsible for creation of the providers (if needed) and then updating the state
 * accordingly. The customizer state methods are responsible for doing correct updates of the state itself. This
 * decoupling is in place so that it is possible to seal the state and prevent write operations from some point
 * onward. See {@link SealedDateFilterCustomizerState} for more motivation behind this.
 *
 * @internal
 */
export class DefaultDateFiltersCustomizer implements IDateFiltersCustomizer {
    private readonly logger: IDashboardCustomizationLogger;
    private state: IDateFiltersCustomizerState;

    constructor(
        logger: IDashboardCustomizationLogger,
        defaultProvider: DateFilterComponentProvider = DefaultDateFilterRendererProvider,
    ) {
        this.logger = logger;
        this.state = new DefaultDateFiltersCustomizerState(defaultProvider);
    }

    public withCustomProvider = (provider: OptionalDateFilterComponentProvider): IDateFiltersCustomizer => {
        this.state.addCustomProvider(provider);

        return this;
    };

    public getDateFilterProvider = (): DateFilterComponentProvider => {
        return this.state.getRootProvider();
    };

    public sealCustomizer = (): void => {
        this.state = new SealedDateFiltersCustomizerState(this.logger, this.state);
    };
}
