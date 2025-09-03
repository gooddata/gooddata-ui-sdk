// (C) 2022-2025 GoodData Corporation
import React from "react";

import union from "lodash/union.js";
import { InvariantError } from "ts-invariant";

import { IDashboardCustomizationLogger } from "./customizationLogging.js";
import { CustomizerMutationsContext } from "./types.js";
import {
    CustomFilterBarComponent,
    FilterBarComponentProvider,
    HiddenFilterBar,
    OptionalFilterBarComponentProvider,
    RenderModeAwareFilterBar,
} from "../../presentation/index.js";
import { FilterBarRenderingMode, IFilterBarCustomizer } from "../customizer.js";

const DefaultFilterBarRendererProvider: FilterBarComponentProvider = () => {
    return RenderModeAwareFilterBar;
};

interface IFilterBarCustomizerState {
    setRenderingMode(mode: FilterBarRenderingMode): void;
    getRenderingMode(): FilterBarRenderingMode;
    addCustomProvider(provider: OptionalFilterBarComponentProvider): void;
    getRootProvider(): FilterBarComponentProvider;
    switchRootProvider(provider: FilterBarComponentProvider): void;
}

interface IFilterBarCustomizerResult {
    FilterBarComponent: CustomFilterBarComponent | undefined;
}

class FilterBarCustomizerState implements IFilterBarCustomizerState {
    /*
     * Chain of 'core' providers. Core providers are evaluated from last to first. As soon as some provider
     * returns a Component, then that component will be used for rendering. If provider returns undefined,
     * the evaluation continues to next provider in the chain.
     *
     * Note: the chain is 'primed' with a provider that always returns the default DateFilter renderer. This is
     * essential to allow the decorations to work - purely because decorations can only work if there is
     * something to decorate. See constructor.
     */
    private readonly coreProviderChain: FilterBarComponentProvider[];

    /*
     * Core provider encapsulates resolution using the chain of core providers.
     */
    private readonly coreProvider: FilterBarComponentProvider = (filterBar) => {
        const providerStack = [...this.coreProviderChain].reverse();

        for (const provider of providerStack) {
            const Component = provider(filterBar);

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
    private rootProvider: FilterBarComponentProvider = this.coreProvider;

    private renderingMode: FilterBarRenderingMode | undefined = undefined;
    private logger: IDashboardCustomizationLogger;

    constructor(defaultProvider: FilterBarComponentProvider, logger: IDashboardCustomizationLogger) {
        this.coreProviderChain = [defaultProvider];
        this.logger = logger;
    }

    getRenderingMode = (): FilterBarRenderingMode => {
        return this.renderingMode ?? "default";
    };

    setRenderingMode = (renderingMode: FilterBarRenderingMode): void => {
        if (this.renderingMode) {
            this.logger.warn(
                `Redefining filter bar rendering mode to "${renderingMode}". Previous definition will be discarded.`,
            );
        }
        this.renderingMode = renderingMode;
    };

    addCustomProvider(provider: FilterBarComponentProvider): void {
        this.coreProviderChain.push(provider);
    }

    getRootProvider(): FilterBarComponentProvider {
        return this.rootProvider;
    }

    switchRootProvider(provider: FilterBarComponentProvider): void {
        this.rootProvider = provider;
    }
}

class SealedFilterBarCustomizerState implements IFilterBarCustomizerState {
    constructor(
        private readonly state: IFilterBarCustomizerState,
        private readonly logger: IDashboardCustomizationLogger,
    ) {}

    getRenderingMode = (): FilterBarRenderingMode => {
        return this.state.getRenderingMode();
    };

    setRenderingMode = (_renderingMode: FilterBarRenderingMode): void => {
        this.logger.warn(
            `Attempting to set filter bar rendering mode outside of plugin registration. Ignoring.`,
        );
    };

    public addCustomProvider = (_provider: FilterBarComponentProvider): void => {
        this.logger.warn(
            `Attempting to customize FilterBar rendering outside of plugin registration. Ignoring.`,
        );
    };

    public switchRootProvider = (_provider: FilterBarComponentProvider): void => {
        this.logger.warn(
            `Attempting to customize FilterBar rendering outside of plugin registration. Ignoring.`,
        );
    };

    public getRootProvider = (): FilterBarComponentProvider => {
        return this.state.getRootProvider();
    };
}

/**
 * @internal
 */
export class DefaultFilterBarCustomizer implements IFilterBarCustomizer {
    private readonly logger: IDashboardCustomizationLogger;
    private readonly mutationContext: CustomizerMutationsContext;
    private state: IFilterBarCustomizerState;
    private updated = false;

    constructor(
        logger: IDashboardCustomizationLogger,
        mutationContext: CustomizerMutationsContext,
        defaultProvider: FilterBarComponentProvider = DefaultFilterBarRendererProvider,
    ) {
        this.logger = logger;
        this.mutationContext = mutationContext;
        this.state = new FilterBarCustomizerState(defaultProvider, logger);
    }

    setRenderingMode = (mode: FilterBarRenderingMode): this => {
        this.state.setRenderingMode(mode);

        return this;
    };

    public withCustomProvider = (provider: OptionalFilterBarComponentProvider): IFilterBarCustomizer => {
        this.state.addCustomProvider(provider);
        this.mutationContext.filterBar = union(this.mutationContext.filterBar, ["provider"]);
        this.updated = true;

        return this;
    };

    public withCustomDecorator(
        providerFactory: (next: FilterBarComponentProvider) => OptionalFilterBarComponentProvider,
    ): IFilterBarCustomizer {
        // snapshot current root provider
        const rootSnapshot = this.state.getRootProvider();
        // call user's factory in order to obtain the actual provider - pass the current root so that user's
        // code can use it to obtain component to decorate
        const decoratorProvider = providerFactory(rootSnapshot);
        // construct new root provider; this will be using user's provider with a fallback to root provider
        // in case user's code does not return anything
        const newRootProvider: FilterBarComponentProvider = (props) => {
            const Component = decoratorProvider(props);

            if (Component) {
                return Component;
            }

            return rootSnapshot(props);
        };

        // finally modify the root provider; next time someone registers decorator, it will be on top of
        // this currently registered one
        this.state.switchRootProvider(newRootProvider);
        this.mutationContext.filterBar = union(this.mutationContext.filterBar, ["decorator"]);
        this.updated = true;

        return this;
    }

    getCustomizerResult = (): IFilterBarCustomizerResult => {
        const hidden = this.state.getRenderingMode() === "hidden";
        const updated = this.updated;

        return {
            // if rendering mode is "hidden", explicitly replace the component with HiddenFilterBar,
            // otherwise do nothing to allow the default or any custom component provided by the embedding application
            // to kick in
            FilterBarComponent: hidden
                ? HiddenFilterBar
                : updated
                  ? (props) => {
                        const Comp = this.state.getRootProvider()(props);
                        return <Comp {...props} />;
                    }
                  : undefined,
        };
    };

    sealCustomizer = (): this => {
        this.state = new SealedFilterBarCustomizerState(this.state, this.logger);

        return this;
    };
}
