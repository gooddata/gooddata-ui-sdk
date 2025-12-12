// (C) 2021-2025 GoodData Corporation
import {
    type IBaseWidget,
    type IDrillableWidget,
    type IFilterableWidget,
    type IWidgetDescription,
} from "./baseWidget.js";
import { type IDashboardObjectIdentity } from "./common.js";
import { type InsightDrillDefinition, type KpiDrillDefinition } from "./drill.js";
import { type IKpi } from "./kpi.js";
import { type VisualizationProperties } from "../insight/index.js";
import { type ObjRef } from "../objRef/index.js";

/**
 * Reserved type names used for dashboard's built-in analytical widgets.
 *
 * @public
 */
export type AnalyticalWidgetType = "kpi" | "insight" | "richText" | "visualizationSwitcher";

/**
 * Analytical Widgets are a sub-type of dashboard widgets that display analytics. Be it charts rendering
 * insights (reports) or KPIs rendering measure values optionally with their comparison.
 *
 * @public
 */
export interface IAnalyticalWidget
    extends IBaseWidget,
        IWidgetDescription,
        IFilterableWidget,
        IDrillableWidget {
    readonly type: AnalyticalWidgetType;
}

/**
 * @public
 */
export interface IKpiWidgetBase extends IAnalyticalWidget {
    readonly type: "kpi";

    /**
     * Temporary place for legacy kpi properties
     */
    readonly kpi: IKpi;

    /**
     * Drill interactions configured for the kpi widget.
     */
    readonly drills: KpiDrillDefinition[];

    /**
     * Configuration of the kpi itself
     */
    readonly configuration?: IKpiWidgetConfiguration;
}

/**
 * @public
 */
export interface IKpiWidgetConfiguration {
    description?: IKpiWidgetDescriptionConfiguration;
}

/**
 * Configuration of kpi's description
 * @public
 */
export interface IKpiWidgetDescriptionConfiguration {
    /**
     * whether description should be visible or not
     */
    visible: boolean;
    /**
     * whether description should be used from kpi or inherited from its metric
     */
    source: KpiWidgetDescriptionSourceType;
}

/**
 * @public
 */
export type KpiWidgetDescriptionSourceType = "kpi" | "metric";

/**
 * @public
 */
export interface IKpiWidget extends IKpiWidgetBase, IDashboardObjectIdentity {}

/**
 * @public
 */
export interface IKpiWidgetDefinition extends IKpiWidgetBase, Partial<IDashboardObjectIdentity> {}

/**
 * @public
 */
export interface IInsightWidgetBase extends IAnalyticalWidget {
    readonly type: "insight";

    /**
     * Widget insight object reference (when widget is not kpi)
     */
    readonly insight: ObjRef;

    /**
     * Overrides for visualization-specific properties.
     * Insight rendered in context of this widget
     * will use these properties instead of its own.
     *
     * This is now only supported for the PivotTable.
     *
     */
    readonly properties?: VisualizationProperties;

    /**
     * Drill interactions configured for the insight widget.
     */
    readonly drills: InsightDrillDefinition[];

    /**
     * Configuration of the widget itself regardless of the visualization type
     */
    readonly configuration?: IInsightWidgetConfiguration;
}

/**
 * @public
 */
export interface IInsightWidgetConfiguration {
    hideTitle?: boolean;
    description?: IInsightWidgetDescriptionConfiguration;
}

/**
 * Configuration of widget's description
 * @public
 */
export interface IInsightWidgetDescriptionConfiguration {
    /**
     * whether description should be visible or not
     */
    visible: boolean;
    /**
     * whether description should be used from widget or inherited from its insight
     */
    source: InsightWidgetDescriptionSourceType;
    /**
     * whether description should include also info about insight's metrics
     */
    includeMetrics: boolean;
}

/**
 * @public
 */
export type InsightWidgetDescriptionSourceType = "widget" | "insight";

/**
 * @public
 */
export interface IInsightWidget extends IInsightWidgetBase, IDashboardObjectIdentity {}

/**
 * @public
 */
export interface IInsightWidgetDefinition extends IInsightWidgetBase, Partial<IDashboardObjectIdentity> {}

/**
 * @public
 */
export interface IRichTextWidgetBase extends IAnalyticalWidget {
    readonly type: "richText";

    /**
     * Markdown text of the rich text widget.
     */
    readonly content: string;
}

/**
 * @public
 */
export interface IRichTextWidget extends IRichTextWidgetBase, IDashboardObjectIdentity {}

/**
 * @public
 */
export interface IRichTextWidgetDefinition extends IRichTextWidgetBase, Partial<IDashboardObjectIdentity> {}

/**
 * @public
 */
export interface IVisualizationSwitcherWidgetBase extends IAnalyticalWidget {
    readonly type: "visualizationSwitcher";

    /**
     * List of visualizations which are part of the visualization switcher.
     * First visualization in the list is the one that is selected as default.
     */
    readonly visualizations: IInsightWidget[];
}

/**
 * @public
 */
export interface IVisualizationSwitcherWidget
    extends IVisualizationSwitcherWidgetBase,
        IDashboardObjectIdentity {}

/**
 * @public
 */
export interface IVisualizationSwitcherWidgetDefinition
    extends IVisualizationSwitcherWidgetBase,
        Partial<IDashboardObjectIdentity> {}
