// (C) 2026 GoodData Corporation

import { InvariantError } from "ts-invariant";

import {
    type MeasureValueFilterComponentProvider,
    type OptionalMeasureValueFilterComponentProvider,
} from "../../presentation/dashboardContexts/types.js";
import { DefaultDashboardMeasureValueFilter } from "../../presentation/filterBar/measureValueFilter/DefaultDashboardMeasureValueFilter.js";
import { type IMeasureValueFiltersCustomizer } from "../customizer.js";

import { type IDashboardCustomizationLogger } from "./customizationLogging.js";

const DefaultMeasureValueFilterRendererProvider: MeasureValueFilterComponentProvider = () => {
    return DefaultDashboardMeasureValueFilter;
};

interface IMeasureValueFiltersCustomizerState {
    addCustomProvider(provider: OptionalMeasureValueFilterComponentProvider): void;
    getRootProvider(): MeasureValueFilterComponentProvider;
    switchRootProvider(provider: MeasureValueFilterComponentProvider): void;
}

class DefaultMeasureValueFiltersCustomizerState implements IMeasureValueFiltersCustomizerState {
    private readonly coreProviderChain: MeasureValueFilterComponentProvider[];

    private readonly coreProvider: MeasureValueFilterComponentProvider = (measureValueFilter) => {
        const providerStack = [...this.coreProviderChain].reverse();

        for (const provider of providerStack) {
            const Component = provider(measureValueFilter);

            if (Component) {
                return Component;
            }
        }

        throw new InvariantError();
    };

    private rootProvider: MeasureValueFilterComponentProvider = this.coreProvider;

    constructor(defaultProvider: MeasureValueFilterComponentProvider) {
        this.coreProviderChain = [defaultProvider];
    }

    addCustomProvider(provider: MeasureValueFilterComponentProvider): void {
        this.coreProviderChain.push(provider);
    }

    getRootProvider(): MeasureValueFilterComponentProvider {
        return this.rootProvider;
    }

    switchRootProvider(provider: MeasureValueFilterComponentProvider): void {
        this.rootProvider = provider;
    }
}

class SealedMeasureValueFiltersCustomizerState implements IMeasureValueFiltersCustomizerState {
    constructor(
        private readonly logger: IDashboardCustomizationLogger,
        private readonly state: IMeasureValueFiltersCustomizerState,
    ) {}

    public addCustomProvider = (_provider: MeasureValueFilterComponentProvider): void => {
        this.logger.warn(
            `Attempting to customize MeasureValueFilter rendering outside of plugin registration. Ignoring.`,
        );
    };

    public switchRootProvider = (_provider: MeasureValueFilterComponentProvider): void => {
        this.logger.warn(
            `Attempting to customize MeasureValueFilter rendering outside of plugin registration. Ignoring.`,
        );
    };

    public getRootProvider = (): MeasureValueFilterComponentProvider => {
        return this.state.getRootProvider();
    };
}

/**
 * Default implementation of the MeasureValueFilter rendering customizer.
 *
 * @internal
 */
export class DefaultMeasureValueFiltersCustomizer implements IMeasureValueFiltersCustomizer {
    private readonly logger: IDashboardCustomizationLogger;
    private state: IMeasureValueFiltersCustomizerState;

    constructor(
        logger: IDashboardCustomizationLogger,
        defaultProvider: MeasureValueFilterComponentProvider = DefaultMeasureValueFilterRendererProvider,
    ) {
        this.logger = logger;
        this.state = new DefaultMeasureValueFiltersCustomizerState(defaultProvider);
    }

    public withCustomProvider = (provider: OptionalMeasureValueFilterComponentProvider): this => {
        this.state.addCustomProvider(provider);

        return this;
    };

    public getMeasureValueFilterProvider = (): MeasureValueFilterComponentProvider => {
        return this.state.getRootProvider();
    };

    public sealCustomizer = (): void => {
        this.state = new SealedMeasureValueFiltersCustomizerState(this.logger, this.state);
    };
}
