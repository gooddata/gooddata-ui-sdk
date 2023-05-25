// (C) 2021-2023 GoodData Corporation

import {
    IDashboardLayout,
    isInsightWidget,
    isInsightWidgetDefinition,
    isKpiWidget,
    isKpiWidgetDefinition,
    objRefToString,
    isObjRef,
} from "@gooddata/sdk-model";
import { walkLayout } from "@gooddata/sdk-backend-spi";

import {
    IDashboardCustomizer,
    IDashboardInsightCustomizer,
    IDashboardKpiCustomizer,
    IDashboardLayoutCustomizer,
    IDashboardWidgetCustomizer,
    IFilterBarCustomizer,
    IFiltersCustomizer,
} from "../customizer.js";
import { IDashboardExtensionProps } from "../../presentation/index.js";
import { DefaultInsightCustomizer } from "./insightCustomizer.js";
import { DashboardCustomizationLogger } from "./customizationLogging.js";
import { IDashboardPluginContract_V1 } from "../plugin.js";
import { DefaultKpiCustomizer } from "./kpiCustomizer.js";
import { DefaultWidgetCustomizer } from "./widgetCustomizer.js";
import { DefaultLayoutCustomizer } from "./layoutCustomizer.js";
import { DefaultFilterBarCustomizer } from "./filterBarCustomizer.js";
import { DefaultFiltersCustomizer } from "./filtersCustomizer.js";
import { createCustomizerMutationsContext } from "./types.js";
import { WidgetsOverlayFn, IDashboardWidgetOverlay } from "../../model/index.js";

/**
 * @internal
 */
export class DashboardCustomizationBuilder implements IDashboardCustomizer {
    private readonly mutations = createCustomizerMutationsContext();
    private readonly logger: DashboardCustomizationLogger = new DashboardCustomizationLogger();
    private readonly insightCustomizer: DefaultInsightCustomizer = new DefaultInsightCustomizer(
        this.logger,
        this.mutations,
    );
    private readonly kpiCustomizer: DefaultKpiCustomizer = new DefaultKpiCustomizer(
        this.logger,
        this.mutations,
    );
    private readonly widgetCustomizer: DefaultWidgetCustomizer = new DefaultWidgetCustomizer(this.logger);
    private readonly layoutCustomizer: DefaultLayoutCustomizer = new DefaultLayoutCustomizer(
        this.logger,
        this.mutations,
    );
    private readonly filterBarCustomizer: DefaultFilterBarCustomizer = new DefaultFilterBarCustomizer(
        this.logger,
    );
    private readonly filtersCustomizer: DefaultFiltersCustomizer = new DefaultFiltersCustomizer(this.logger);
    private widgetOverlays: Record<string, IDashboardWidgetOverlay> = {};

    private sealCustomizers = (): void => {
        this.insightCustomizer.sealCustomizer();
        this.kpiCustomizer.sealCustomizer();
        this.widgetCustomizer.sealCustomizer();
        this.filtersCustomizer.sealCustomizer();
        this.layoutCustomizer.sealCustomizer();
    };

    public setWidgetOverlays = (widgetOverlays?: Record<string, IDashboardWidgetOverlay>) => {
        this.widgetOverlays = widgetOverlays || {};
    };

    public insightWidgets = (): IDashboardInsightCustomizer => {
        return this.insightCustomizer;
    };

    public kpiWidgets = (): IDashboardKpiCustomizer => {
        return this.kpiCustomizer;
    };

    public customWidgets = (): IDashboardWidgetCustomizer => {
        return this.widgetCustomizer;
    };

    public layout = (): IDashboardLayoutCustomizer => {
        return this.layoutCustomizer;
    };

    public filterBar = (): IFilterBarCustomizer => {
        return this.filterBarCustomizer;
    };

    public filters = (): IFiltersCustomizer => {
        return this.filtersCustomizer;
    };

    public onBeforePluginRegister = (plugin: IDashboardPluginContract_V1): void => {
        this.logger.setCurrentPlugin(plugin);
        this.logger.log("Starting registration.");
    };

    public onAfterPluginRegister = (): void => {
        this.logger.log("Registration finished.");
        this.logger.setCurrentPlugin(undefined);
    };

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public onPluginRegisterError = (error: any): void => {
        this.logger.error(
            "Plugin register() method threw and exception. Plugin may be partially registered.",
            error,
        );
        this.logger.setCurrentPlugin(undefined);
    };

    public build = (): IDashboardExtensionProps => {
        const filterBarCustomizerResult = this.filterBarCustomizer.getCustomizerResult();

        const props: IDashboardExtensionProps = {
            InsightComponentProvider: this.insightCustomizer.getInsightProvider(),
            InsightBodyComponentProvider: this.insightCustomizer.getInsightBodyComponentProvider(),
            KpiComponentProvider: this.kpiCustomizer.getKpiProvider(),
            WidgetComponentProvider: this.widgetCustomizer.getWidgetComponentProvider(),
            DashboardAttributeFilterComponentProvider: this.filtersCustomizer
                .attribute()
                .getAttributeFilterProvider(),
            DashboardDateFilterComponentProvider: this.filtersCustomizer.date().getDateFilterProvider(),
            customizationFns: {
                existingDashboardTransformFn: this.layoutCustomizer.getExistingDashboardTransformFn(),
            },
            widgetsOverlayFn: this.getWidgetsOverlayFn(),
            // only set the value if there is anything to set
            ...(filterBarCustomizerResult.FilterBarComponent
                ? { FilterBarComponent: filterBarCustomizerResult.FilterBarComponent }
                : {}),
        };

        this.sealCustomizers();

        return props;
    };

    private getWidgetsOverlayFn(): WidgetsOverlayFn {
        return (dashboard) => {
            const overlays: Record<string, IDashboardWidgetOverlay> = { ...this.widgetOverlays };
            const { insight, kpi, layouts } = this.mutations;
            const { layout } = dashboard;

            walkLayout(layout as IDashboardLayout, {
                itemCallback: (item) => {
                    if (
                        (isInsightWidget(item.widget) || isInsightWidgetDefinition(item.widget)) &&
                        isObjRef(item.widget) &&
                        insight.length > 0
                    ) {
                        mergeOverlays(overlays, objRefToString(item.widget), true, "modifiedByPlugin");
                    }
                    if (
                        (isKpiWidget(item.widget) || isKpiWidgetDefinition(item.widget)) &&
                        isObjRef(item.widget) &&
                        kpi.length > 0
                    ) {
                        mergeOverlays(overlays, objRefToString(item.widget), true, "modifiedByPlugin");
                    }
                },
            });

            Object.keys(layouts).forEach((ref) => {
                if (layouts[ref] === "inserted") {
                    mergeOverlays(overlays, ref, true, "insertedByPlugin");
                }
            });

            return overlays;
        };
    }
}

function mergeOverlays(
    overlays: Record<string, IDashboardWidgetOverlay>,
    ref: string,
    showOverlay: boolean,
    modification: IDashboardWidgetOverlay["modification"],
) {
    const current: IDashboardWidgetOverlay | undefined = overlays[ref];
    const created: IDashboardWidgetOverlay = {
        showOverlay,
        modification,
    };

    overlays[ref] = {
        ...created,
        ...(current ? current : {}),
    };
}
