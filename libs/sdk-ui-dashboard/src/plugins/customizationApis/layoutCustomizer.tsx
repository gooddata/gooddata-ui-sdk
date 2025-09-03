// (C) 2021-2025 GoodData Corporation
import React from "react";

import union from "lodash/union.js";
import { InvariantError } from "ts-invariant";

import { IDashboardLayout } from "@gooddata/sdk-model";

import { IDashboardCustomizationLogger } from "./customizationLogging.js";
import { ExportLayoutCustomizer } from "./exportLayoutCustomizer.js";
import { FluidLayoutCustomizer } from "./fluidLayoutCustomizer.js";
import { CustomizerMutationsContext } from "./types.js";
import { DashboardTransformFn, ExtendedDashboardWidget } from "../../model/index.js";
import { DashboardFocusObject, DashboardLayoutExportTransformFn } from "../../model/types/commonTypes.js";
import {
    CustomDashboardLayoutComponent,
    DefaultDashboardLayout as DefaultDashboardLayoutComponent,
    LayoutComponentProvider,
    OptionalLayoutComponentProvider,
} from "../../presentation/index.js";
import {
    ExportLayoutCustomizationFn,
    FluidLayoutCustomizationFn,
    IDashboardLayoutCustomizer,
} from "../customizer.js";

interface ILayoutCustomizerState {
    addCustomProvider(provider: OptionalLayoutComponentProvider): void;
    getRootProvider(): LayoutComponentProvider;
    switchRootProvider(provider: LayoutComponentProvider): void;
}

interface ILayoutCustomizerResult {
    LayoutComponent: CustomDashboardLayoutComponent | undefined;
}

const DefaultDashboardLayout: LayoutComponentProvider = () => {
    return DefaultDashboardLayoutComponent;
};

class DefaultLayoutCustomizerState implements ILayoutCustomizerState {
    /*
     * Chain of 'core' providers. Core providers are evaluated from last to first. As soon as some provider
     * returns a Component, then that component will be used for rendering. If provider returns undefined,
     * the evaluation continues to next provider in the chain.
     *
     * Note: the chain is 'primed' with a provider that always returns the default DateFilter renderer. This is
     * essential to allow the decorations to work - purely because decorations can only work if there is
     * something to decorate. See constructor.
     */
    private readonly coreProviderChain: LayoutComponentProvider[];

    /*
     * Core provider encapsulates resolution using the chain of core providers.
     */
    private readonly coreProvider: LayoutComponentProvider = (layout) => {
        const providerStack = [...this.coreProviderChain].reverse();

        for (const provider of providerStack) {
            const Component = provider(layout);

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
    private rootProvider: LayoutComponentProvider = this.coreProvider;

    constructor(defaultProvider: LayoutComponentProvider) {
        this.coreProviderChain = [defaultProvider];
    }

    addCustomProvider(provider: LayoutComponentProvider): void {
        this.coreProviderChain.push(provider);
    }

    getRootProvider(): LayoutComponentProvider {
        return this.rootProvider;
    }

    switchRootProvider(provider: LayoutComponentProvider): void {
        this.rootProvider = provider;
    }
}

export class DefaultLayoutCustomizer implements IDashboardLayoutCustomizer {
    private readonly logger: IDashboardCustomizationLogger;
    private readonly mutationContext: CustomizerMutationsContext;
    private readonly fluidLayoutTransformations: FluidLayoutCustomizationFn[] = [];
    private readonly exportLayoutTransformations: ExportLayoutCustomizationFn[] = [];
    private updated = false;
    private sealed = false;
    private state: ILayoutCustomizerState;

    constructor(
        logger: IDashboardCustomizationLogger,
        mutationContext: CustomizerMutationsContext,
        defaultProvider: LayoutComponentProvider = DefaultDashboardLayout,
    ) {
        this.logger = logger;
        this.mutationContext = mutationContext;
        this.state = new DefaultLayoutCustomizerState(defaultProvider);
    }

    public customizeFluidLayout = (
        customizationFn: FluidLayoutCustomizationFn,
    ): IDashboardLayoutCustomizer => {
        if (this.sealed) {
            this.logger.warn(
                `Attempting to add layout customization outside of plugin registration. Ignoring.`,
            );
        } else {
            this.fluidLayoutTransformations.push(customizationFn);
        }

        return this;
    };

    public customizeExportLayout = (
        customizationFn: ExportLayoutCustomizationFn,
    ): IDashboardLayoutCustomizer => {
        if (this.sealed) {
            this.logger.warn(
                `Attempting to add layout export customization outside of plugin registration. Ignoring.`,
            );
        } else {
            this.exportLayoutTransformations.push(customizationFn);
        }

        return this;
    };

    public withCustomProvider = (provider: OptionalLayoutComponentProvider): IDashboardLayoutCustomizer => {
        if (this.sealed) {
            this.logger.warn(
                `Attempting to customize Layout rendering outside of plugin registration. Ignoring.`,
            );
            return this;
        }

        this.state.addCustomProvider(provider);
        this.mutationContext.layout = union(this.mutationContext.layout, ["provider"]);
        this.updated = true;

        return this;
    };

    public withCustomDecorator(
        providerFactory: (next: LayoutComponentProvider) => OptionalLayoutComponentProvider,
    ): IDashboardLayoutCustomizer {
        if (this.sealed) {
            this.logger.warn(
                `Attempting to customize Layout rendering outside of plugin registration. Ignoring.`,
            );
            return this;
        }

        // snapshot current root provider
        const rootSnapshot = this.state.getRootProvider();
        // call user's factory in order to obtain the actual provider - pass the current root so that user's
        // code can use it to obtain component to decorate
        const decoratorProvider = providerFactory(rootSnapshot);
        // construct new root provider; this will be using user's provider with a fallback to root provider
        // in case user's code does not return anything
        const newRootProvider: LayoutComponentProvider = (props) => {
            const Component = decoratorProvider(props);

            if (Component) {
                return Component;
            }

            return rootSnapshot(props);
        };

        // finally modify the root provider; next time someone registers decorator, it will be on top of
        // this currently registered one
        this.state.switchRootProvider(newRootProvider);
        this.mutationContext.layout = union(this.mutationContext.layout, ["decorator"]);
        this.updated = true;

        return this;
    }

    getCustomizerResult = (): ILayoutCustomizerResult => {
        return {
            LayoutComponent: this.updated
                ? (props) => {
                      const Comp = this.state.getRootProvider()(props);
                      return <Comp {...props} />;
                  }
                : undefined,
        };
    };

    public sealCustomizer = (): IDashboardLayoutCustomizer => {
        this.sealed = true;

        return this;
    };

    getExistingDashboardTransformFn = (): DashboardTransformFn => {
        const snapshot = [...this.fluidLayoutTransformations];

        return (dashboard) => {
            const { layout } = dashboard;

            /*
             * Once the dashboard component supports multiple layout types, then the code here must only
             * perform the transformations applicable for the dashboard's layout type..
             *
             * At this point, since dashboard only supports fluid layout, the code tests that there is a
             * layout in a dashboard and is of expected type. This condition will be always true for
             * non-empty, non-corrupted dashboards
             */

            if (!layout || layout.type !== "IDashboardLayout") {
                return undefined;
            }

            const newLayout = snapshot.reduce((currentLayout, fn) => {
                // Create a new fluid layout customizer just for this round of processing
                const customizer = new FluidLayoutCustomizer(this.logger, this.mutationContext);

                try {
                    // call out to the plugin-provided function with the current value of the layout & the
                    // customizer to use. the custom function may now inspect the layout & use the customizer
                    // to add sections or items. customizer will not reflect those changes immediately. instead
                    // it will accumulate those operations
                    fn(currentLayout, customizer);
                    // now make the customizer apply the registered layout modifications; this is done so that
                    // customizer can guarantee that all new items are added at first (keeping the original
                    // section indexes) and only then new sections are added
                    return customizer.applyTransformations(currentLayout);
                } catch (e) {
                    this.logger.error(
                        "An error has occurred while transforming fluid dashboard layout. Skipping failed transformation.",
                        e,
                    );

                    return currentLayout;
                }
            }, layout as IDashboardLayout<ExtendedDashboardWidget>);

            return {
                ...dashboard,
                layout: newLayout,
            };
        };
    };

    getExistingLayoutTransformFn = (): DashboardLayoutExportTransformFn => {
        const snapshot = [...this.exportLayoutTransformations];
        const { logger, mutationContext } = this;

        function handler<TWidget>(
            layout: IDashboardLayout<TWidget>,
            focusedObject?: DashboardFocusObject,
        ): IDashboardLayout<TWidget> | undefined {
            /*
             * Once the dashboard component supports multiple layout types, then the code here must only
             * perform the transformations applicable for the dashboard's layout type..
             *
             * At this point, since dashboard only supports fluid layout, the code tests that there is a
             * layout in a dashboard and is of expected type. This condition will be always true for
             * non-empty, non-corrupted dashboards
             */
            if (!layout || layout.type !== "IDashboardLayout") {
                return undefined;
            }

            /*
             * Do not apply any transformations if there is some focused object. This is because the export
             * layout transformer in plugin is not able to handle focused objects.
             */
            if (focusedObject && Object.values(focusedObject).some((value) => value !== undefined)) {
                return undefined;
            }

            //We need to skip export layout changes if nothing defined, than default transformer
            //will be used
            if (snapshot.length === 0) {
                return undefined;
            }

            const newLayout = snapshot.reduce((currentLayout, fn) => {
                // Create a new fluid layout customizer just for this round of processing
                const customizer = new ExportLayoutCustomizer<TWidget>(logger, mutationContext);

                try {
                    // call out to the plugin-provided function with the current value of the layout & the
                    // customizer to use. the custom function may now inspect the layout & use the customizer
                    // to add sections or items. customizer will not reflect those changes immediately. instead
                    // it will accumulate those operations
                    fn(currentLayout as IDashboardLayout, customizer);
                    // now make the customizer apply the registered layout modifications; this is done so that
                    // customizer can guarantee that all new items are added at first (keeping the original
                    // section indexes) and only then new sections are added
                    return customizer.applyTransformations(
                        currentLayout as IDashboardLayout<TWidget>,
                    ) as IDashboardLayout<ExtendedDashboardWidget>;
                } catch (e) {
                    logger.error(
                        "An error has occurred while transforming export dashboard layout. Skipping failed transformation.",
                        e,
                    );

                    return currentLayout as IDashboardLayout<ExtendedDashboardWidget>;
                }
            }, layout as IDashboardLayout<ExtendedDashboardWidget>);

            return {
                ...layout,
                sections: newLayout.sections,
            } as IDashboardLayout<TWidget>;
        }

        return handler;
    };
}
