// (C) 2021-2025 GoodData Corporation

import { walkLayout } from "@gooddata/sdk-backend-spi";
import {
    IDashboardLayout,
    isInsightWidget,
    isInsightWidgetDefinition,
    isKpiWidget,
    isKpiWidgetDefinition,
    isObjRef,
    objRefToString,
} from "@gooddata/sdk-model";

import { DashboardCustomizationLogger } from "./customizationLogging.js";
import { DefaultDashboardContentCustomizer } from "./dashboardContentCustomizer.js";
import { DefaultFilterBarCustomizer } from "./filterBarCustomizer.js";
import { DefaultFiltersCustomizer } from "./filtersCustomizer.js";
import { DefaultInsightCustomizer } from "./insightCustomizer.js";
import { DefaultLayoutCustomizer } from "./layoutCustomizer.js";
import { DefaultLoadingCustomizer } from "./loadingCustomizer.js";
import { DefaultRichTextCustomizer } from "./richTextCustomizer.js";
import { DefaultTitleCustomizer } from "./titleCustomizer.js";
import { DefaultTopBarCustomizer } from "./topBarCustomizer.js";
import { createCustomizerMutationsContext } from "./types.js";
import { DefaultVisualizationSwitcherCustomizer } from "./visualizationSwitcherCustomizer.js";
import { DefaultWidgetCustomizer } from "./widgetCustomizer.js";
import { IDashboardWidgetOverlay, WidgetsOverlayFn } from "../../model/index.js";
import { IDashboardExtensionProps } from "../../presentation/index.js";
import {
    IDashboardContentCustomizer,
    IDashboardCustomizer,
    IDashboardInsightCustomizer,
    IDashboardLayoutCustomizer,
    IDashboardWidgetCustomizer,
    IFilterBarCustomizer,
    IFiltersCustomizer,
    ILoadingCustomizer,
    IRichTextCustomizer,
    ITitleCustomizer,
    ITopBarCustomizer,
    IVisualizationSwitcherCustomizer,
} from "../customizer.js";
import { IDashboardPluginContract_V1 } from "../plugin.js";

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
    private readonly widgetCustomizer: DefaultWidgetCustomizer = new DefaultWidgetCustomizer(this.logger);
    private readonly layoutCustomizer: DefaultLayoutCustomizer = new DefaultLayoutCustomizer(
        this.logger,
        this.mutations,
    );
    private readonly filterBarCustomizer: DefaultFilterBarCustomizer = new DefaultFilterBarCustomizer(
        this.logger,
        this.mutations,
    );
    private readonly filtersCustomizer: DefaultFiltersCustomizer = new DefaultFiltersCustomizer(
        this.logger,
        this.mutations,
    );
    private readonly richTextCustomizer: DefaultRichTextCustomizer = new DefaultRichTextCustomizer(
        this.logger,
        this.mutations,
    );
    private readonly visualizationSwitcherCustomizer: DefaultVisualizationSwitcherCustomizer =
        new DefaultVisualizationSwitcherCustomizer(this.logger, this.mutations);
    private readonly dashboardContentCustomizer: DefaultDashboardContentCustomizer =
        new DefaultDashboardContentCustomizer(this.logger, this.mutations);
    private readonly topBarCustomizer: DefaultTopBarCustomizer = new DefaultTopBarCustomizer(
        this.logger,
        this.mutations,
    );
    private readonly titleCustomizer: DefaultTitleCustomizer = new DefaultTitleCustomizer(
        this.logger,
        this.mutations,
    );
    private readonly loadingCustomizer: DefaultLoadingCustomizer = new DefaultLoadingCustomizer(
        this.logger,
        this.mutations,
    );
    private widgetOverlays: Record<string, IDashboardWidgetOverlay> = {};

    private sealCustomizers = (): void => {
        this.insightCustomizer.sealCustomizer();
        this.widgetCustomizer.sealCustomizer();
        this.filtersCustomizer.sealCustomizer();
        this.layoutCustomizer.sealCustomizer();
        this.dashboardContentCustomizer.sealCustomizer();
        this.topBarCustomizer.sealCustomizer();
        this.titleCustomizer.sealCustomizer();
        this.loadingCustomizer.sealCustomizer();
        this.richTextCustomizer.sealCustomizer();
        this.visualizationSwitcherCustomizer.sealCustomizer();
    };

    public setWidgetOverlays = (widgetOverlays?: Record<string, IDashboardWidgetOverlay>) => {
        this.widgetOverlays = widgetOverlays || {};
    };

    public insightWidgets = (): IDashboardInsightCustomizer => {
        return this.insightCustomizer;
    };

    public customWidgets = (): IDashboardWidgetCustomizer => {
        return this.widgetCustomizer;
    };

    public dashboard = (): IDashboardContentCustomizer => {
        return this.dashboardContentCustomizer;
    };

    public topBar = (): ITopBarCustomizer => {
        return this.topBarCustomizer;
    };

    public title = (): ITitleCustomizer => {
        return this.titleCustomizer;
    };

    public loading = (): ILoadingCustomizer => {
        return this.loadingCustomizer;
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

    public richTextWidgets = (): IRichTextCustomizer => {
        return this.richTextCustomizer;
    };

    public visualizationSwitcherWidgets = (): IVisualizationSwitcherCustomizer => {
        return this.visualizationSwitcherCustomizer;
    };

    public onBeforePluginRegister = (plugin: IDashboardPluginContract_V1): void => {
        this.logger.setCurrentPlugin(plugin);
        this.logger.log("Starting registration.");
    };

    public onAfterPluginRegister = (): void => {
        this.logger.log("Registration finished.");
        this.logger.setCurrentPlugin(undefined);
    };

    public onPluginRegisterError = (error: any): void => {
        this.logger.error(
            "Plugin register() method threw and exception. Plugin may be partially registered.",
            error,
        );
        this.logger.setCurrentPlugin(undefined);
    };

    public build = (): IDashboardExtensionProps => {
        const filterBarCustomizerResult = this.filterBarCustomizer.getCustomizerResult();
        const topBarCustomizerResult = this.topBarCustomizer.getCustomizerResult();
        const titleCustomizerResult = this.titleCustomizer.getCustomizerResult();
        const layoutCustomizerResult = this.layoutCustomizer.getCustomizerResult();
        const loadingCustomizerResult = this.loadingCustomizer.getCustomizerResult();

        const props: IDashboardExtensionProps = {
            InsightComponentProvider: this.insightCustomizer.getInsightProvider(),
            InsightBodyComponentProvider: this.insightCustomizer.getInsightBodyComponentProvider(),
            DashboardContentComponentProvider: this.dashboardContentCustomizer.getDashboardContentProvider(),
            WidgetComponentProvider: this.widgetCustomizer.getWidgetComponentProvider(),
            DashboardAttributeFilterComponentProvider: this.filtersCustomizer
                .attribute()
                .getAttributeFilterProvider(),
            DashboardDateFilterComponentProvider: this.filtersCustomizer.date().getDateFilterProvider(),
            RichTextComponentProvider: this.richTextCustomizer.getRichTextComponentProvider(),
            VisualizationSwitcherComponentProvider:
                this.visualizationSwitcherCustomizer.getVisualizationSwitcherComponentProvider(),
            VisualizationSwitcherToolbarComponentProvider:
                this.visualizationSwitcherCustomizer.getVisualizationSwitcherToolbarComponentProvider(),
            customizationFns: {
                existingDashboardTransformFn: this.layoutCustomizer.getExistingDashboardTransformFn(),
                existingExportTransformFn: this.layoutCustomizer.getExistingLayoutTransformFn(),
            },
            widgetsOverlayFn: this.getWidgetsOverlayFn(),
            // only set the value if there is anything to set
            ...(filterBarCustomizerResult.FilterBarComponent
                ? { FilterBarComponent: filterBarCustomizerResult.FilterBarComponent }
                : {}),
            ...(topBarCustomizerResult.TopBarComponent
                ? { TopBarComponent: topBarCustomizerResult.TopBarComponent }
                : {}),
            ...(titleCustomizerResult.TitleComponent
                ? { TitleComponent: titleCustomizerResult.TitleComponent }
                : {}),
            ...(layoutCustomizerResult.LayoutComponent
                ? { LayoutComponent: layoutCustomizerResult.LayoutComponent }
                : {}),
            ...(loadingCustomizerResult.LoadingComponent
                ? { LoadingComponent: loadingCustomizerResult.LoadingComponent }
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
            const firstTabLayout = dashboard.tabs?.[0]?.layout;
            const layoutToTransform = firstTabLayout ?? layout;

            walkLayout(layoutToTransform as IDashboardLayout, {
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
        ...(current || {}),
    };
}
