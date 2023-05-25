// (C) 2021-2022 GoodData Corporation
import { FluidLayoutCustomizationFn, IDashboardLayoutCustomizer } from "../customizer.js";
import { IDashboardCustomizationLogger } from "./customizationLogging.js";
import { FluidLayoutCustomizer } from "./fluidLayoutCustomizer.js";
import { IDashboardLayout } from "@gooddata/sdk-model";
import { DashboardTransformFn, ExtendedDashboardWidget } from "../../model/index.js";
import { CustomizerMutationsContext } from "./types.js";

export class DefaultLayoutCustomizer implements IDashboardLayoutCustomizer {
    private sealed = false;
    private readonly fluidLayoutTransformations: FluidLayoutCustomizationFn[] = [];

    constructor(
        private readonly logger: IDashboardCustomizationLogger,
        private readonly mutationContext: CustomizerMutationsContext,
    ) {}

    public customizeFluidLayout = (
        customizationFn: FluidLayoutCustomizationFn,
    ): IDashboardLayoutCustomizer => {
        if (!this.sealed) {
            this.fluidLayoutTransformations.push(customizationFn);
        } else {
            this.logger.warn(
                `Attempting to add layout customization outside of plugin registration. Ignoring.`,
            );
        }

        return this;
    };

    public sealCustomizer = (): IDashboardLayoutCustomizer => {
        this.sealed = true;

        return this;
    };

    public getExistingDashboardTransformFn = (): DashboardTransformFn => {
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
}
