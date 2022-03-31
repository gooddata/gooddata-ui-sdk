// (C) 2021-2022 GoodData Corporation
import { VisualizationProperties } from "../insight";
import { ObjRef } from "../objRef";
import { IBaseWidget, IWidgetDescription, IFilterableWidget, IDrillableWidget } from "./baseWidget";
import { IDashboardObjectIdentity } from "./common";
import { KpiDrillDefinition, InsightDrillDefinition } from "./drill";
import { ILegacyKpi } from "./kpi";

/**
 * Reserved type names used for dashboard's built-in analytical widgets.
 *
 * @public
 */
export type AnalyticalWidgetType = "kpi" | "insight";

/**
 * @deprecated use {@link AnalyticalWidgetType} instead
 * @public
 */
export type WidgetType = AnalyticalWidgetType;

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
    readonly kpi: ILegacyKpi;

    /**
     * Drill interactions configured for the kpi widget.
     */
    readonly drills: KpiDrillDefinition[];
}

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
}

/**
 * @public
 */
export interface IInsightWidget extends IInsightWidgetBase, IDashboardObjectIdentity {}

/**
 * @public
 */
export interface IInsightWidgetDefinition extends IInsightWidgetBase, Partial<IDashboardObjectIdentity> {}
