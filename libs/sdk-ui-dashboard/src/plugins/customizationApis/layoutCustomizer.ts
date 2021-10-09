// (C) 2021 GoodData Corporation
import { FluidLayoutCustomizationFn, IDashboardLayoutCustomizer } from "../customizer";
import { DashboardCustomizationLogger } from "./customizationLogging";
import { FluidLayoutCustomizer } from "./fluidLayoutCustomizer";
import { IDashboardLayout } from "@gooddata/sdk-backend-spi";
import { DashboardTransformFn, ExtendedDashboardWidget } from "../../model";

export class DefaultLayoutCustomizer implements IDashboardLayoutCustomizer {
    private sealed = false;
    private readonly fluidLayoutTransformations: FluidLayoutCustomizationFn[] = [];

    constructor(private readonly logger: DashboardCustomizationLogger) {}

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

    public getInitialDashboardTransformFn = (): DashboardTransformFn => {
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

            const newLayout = snapshot.reduce((prevLayout, fn) => {
                const customizer = new FluidLayoutCustomizer();

                try {
                    fn(prevLayout, customizer);
                } catch (e) {
                    this.logger.error(
                        "An error has occurred while transforming fluid dashboard layout. Skipping failed transformation.",
                        e,
                    );

                    return prevLayout;
                }

                return customizer.applyTransformations(prevLayout);
            }, layout as IDashboardLayout<ExtendedDashboardWidget>);

            return {
                ...dashboard,
                layout: newLayout,
            };
        };
    };
}
