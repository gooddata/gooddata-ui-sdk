// (C) 2021-2026 GoodData Corporation

import { InvariantError } from "ts-invariant";

import { type DashboardDateFilterOfAnyType } from "@gooddata/sdk-model";

import {
    type DateFilterOfAnyTypeComponentProvider,
    type OptionalDateFilterComponentProvider,
    type OptionalDateFilterOfAnyTypeComponentProvider,
} from "../../presentation/dashboardContexts/types.js";
import { toDateFilterOfAnyTypeProvider } from "../../presentation/filterBar/dateFilter/dateFilterOfAnyTypeProvider.js";
import { DefaultDashboardDateFilter } from "../../presentation/filterBar/dateFilter/DefaultDashboardDateFilter.js";
import { type CustomDashboardDateFilterOfAnyTypeComponent } from "../../presentation/filterBar/dateFilter/types.js";
import { type IDateFiltersCustomizer } from "../customizer.js";

import { type IDashboardCustomizationLogger } from "./customizationLogging.js";

const DefaultDateFilterRendererProvider: DateFilterOfAnyTypeComponentProvider = () => {
    return DefaultDashboardDateFilter;
};

interface IDateFiltersCustomizerState {
    addCustomProvider(provider: OptionalDateFilterOfAnyTypeComponentProvider): void;
    resolve(filter: DashboardDateFilterOfAnyType): CustomDashboardDateFilterOfAnyTypeComponent;
}

class DefaultDateFiltersCustomizerState implements IDateFiltersCustomizerState {
    /*
     * Chain of providers. Providers are evaluated from last to first. As soon as some provider returns
     * a Component, then that component will be used for rendering. If provider returns undefined, the evaluation
     * continues to next provider in the chain.
     *
     * Note: the chain is 'primed' with a provider that always returns the default DateFilter renderer.
     */
    private readonly providerChain: OptionalDateFilterOfAnyTypeComponentProvider[];

    constructor(defaultProvider: DateFilterOfAnyTypeComponentProvider) {
        this.providerChain = [defaultProvider];
    }

    addCustomProvider(provider: OptionalDateFilterOfAnyTypeComponentProvider): void {
        this.providerChain.push(provider);
    }

    resolve(filter: DashboardDateFilterOfAnyType): CustomDashboardDateFilterOfAnyTypeComponent {
        const providerStack = [...this.providerChain].reverse();

        for (const provider of providerStack) {
            const Component = provider(filter);

            if (Component) {
                return Component;
            }
        }

        // if this happens then the provider chain got messed up. by default the chain contains the default
        // provider which never returns undefined
        throw new InvariantError();
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

    public addCustomProvider = (_provider: OptionalDateFilterOfAnyTypeComponentProvider): void => {
        this.logger.warn(
            `Attempting to customize DateFilter rendering outside of plugin registration. Ignoring.`,
        );
    };

    public resolve = (filter: DashboardDateFilterOfAnyType): CustomDashboardDateFilterOfAnyTypeComponent => {
        return this.state.resolve(filter);
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
        defaultProvider: DateFilterOfAnyTypeComponentProvider = DefaultDateFilterRendererProvider,
    ) {
        this.logger = logger;
        this.state = new DefaultDateFiltersCustomizerState(defaultProvider);
    }

    public withCustomProvider = (provider: OptionalDateFilterComponentProvider): IDateFiltersCustomizer => {
        this.state.addCustomProvider(toDateFilterOfAnyTypeProvider(provider));

        return this;
    };

    public withCustomProviderOfAnyType = (
        provider: OptionalDateFilterOfAnyTypeComponentProvider,
    ): IDateFiltersCustomizer => {
        this.state.addCustomProvider(provider);

        return this;
    };

    public getDateFilterOfAnyTypeProvider = (): DateFilterOfAnyTypeComponentProvider => {
        return (filter) => this.state.resolve(filter);
    };

    public sealCustomizer = (): void => {
        this.state = new SealedDateFiltersCustomizerState(this.logger, this.state);
    };
}
