// (C) 2021 GoodData Corporation
import { ILegacyKpi } from "./kpi";
import { InsightDrillDefinition, KpiDrillDefinition } from "./drills";
import { IDashboardObjectIdentity } from "./common";
import { IBaseWidget, IDrillableWidget, IFilterableWidget, IWidgetDescription } from "./baseWidget";
import { ObjRef, VisualizationProperties } from "@gooddata/sdk-model";

/**
 * Reserved type names used for dashboard's built-in analytical widgets.
 *
 * @alpha
 */
export type AnalyticalWidgetType = "kpi" | "insight";

/**
 * @deprecated use {@link AnalyticalWidgetType} instead
 * @alpha
 */
export type WidgetType = AnalyticalWidgetType;

/**
 * Analytical Widgets are a sub-type of dashboard widgets that display analytics. Be it charts rendering
 * insights (reports) or KPIs rendering measure values optionally with their comparison.
 *
 * @alpha
 */
export interface IAnalyticalWidget
    extends IBaseWidget,
        IWidgetDescription,
        IFilterableWidget,
        IDrillableWidget {
    readonly type: AnalyticalWidgetType;
}

/**
 * @alpha
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
 * @alpha
 */
export interface IKpiWidget extends IKpiWidgetBase, IDashboardObjectIdentity {}

/**
 * @alpha
 */
export interface IKpiWidgetDefinition extends IKpiWidgetBase, Partial<IDashboardObjectIdentity> {}

/**
 * @alpha
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
}

/**
 * @alpha
 */
export interface IInsightWidget extends IInsightWidgetBase, IDashboardObjectIdentity {}

/**
 * @alpha
 */
export interface IInsightWidgetDefinition extends IInsightWidgetBase, Partial<IDashboardObjectIdentity> {}
