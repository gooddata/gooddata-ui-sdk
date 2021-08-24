// (C) 2020-2021 GoodData Corporation
import { ObjRef, isObjRef, ObjectType, VisualizationProperties } from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty";
import { IDashboardFilterReference } from "./filterContext";
import { DrillDefinition, InsightDrillDefinition, KpiDrillDefinition } from "./drills";
import { ILegacyKpi } from "./kpi";
import { IDashboardObjectIdentity } from "./common";
import invariant from "ts-invariant";
import { CatalogItem } from "../fromModel/ldm/catalog";

/**
 * Temporary type to distinguish between kpi and insight
 * @alpha
 */
export type WidgetType = "kpi" | "insight";

/**
 * Widgets are insights or kpis with additional settings - drilling and alerting
 * @alpha
 */
export interface IWidgetBase {
    /**
     * Widget title
     */
    readonly title: string;

    /**
     * Widget description
     */
    readonly description: string;

    /**
     * Ignore particular dashboard filters in the current widget
     */
    readonly ignoreDashboardFilters: IDashboardFilterReference[];

    /**
     * Date data set widget is connected to
     */
    readonly dateDataSet?: ObjRef;

    /**
     * Widget type - kpi or insight
     */
    readonly type: WidgetType;

    /**
     * Widget drills
     */
    readonly drills: DrillDefinition[];
}

/**
 * @alpha
 */
export interface IKpiWidgetBase extends IWidgetBase {
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
export interface IInsightWidgetBase extends IWidgetBase {
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

/**
 * See {@link IWidget}]
 * @alpha
 */
export type IWidgetDefinition = IKpiWidgetDefinition | IInsightWidgetDefinition;

/**
 * @alpha
 */
export type IWidget = IKpiWidget | IInsightWidget;

/**
 * List of currently supported types of references that can be retrieved using getWidgetReferencedObjects()
 * @alpha
 */
export type SupportedWidgetReferenceTypes = Exclude<
    ObjectType,
    "fact" | "attribute" | "displayForm" | "dataSet" | "tag" | "insight" | "variable"
>;

/**
 * Contains information about objects that may be referenced by a widget. The contents of this object
 * depend on the widget and the types requested at the time of call to getWidgetReferencedObjects.
 *
 * @alpha
 */
export interface IWidgetReferences {
    /**
     * If requested, measures referenced by the widget will be returned here.
     * If none of them were requested, the catalogItems will be undefined.
     */
    catalogItems?: CatalogItem[];
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IWidgetDefinition}.
 * @alpha
 */
export function isWidgetDefinition(obj: unknown): obj is IWidgetDefinition {
    return hasWidgetProps(obj) && !isObjRef((obj as any).ref);
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IWidget}.
 * @alpha
 */
export function isWidget(obj: unknown): obj is IWidget {
    return hasWidgetProps(obj) && isObjRef((obj as any).ref);
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IInsightWidget}.
 * @alpha
 */
export function isInsightWidget(obj: unknown): obj is IInsightWidget {
    return isWidget(obj) && (obj as IInsightWidget).type === "insight";
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IInsightWidgetDefinition}.
 * @alpha
 */
export function isInsightWidgetDefinition(obj: unknown): obj is IInsightWidgetDefinition {
    return isWidgetDefinition(obj) && (obj as IInsightWidget).type === "insight";
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IKpiWidget}.
 * @alpha
 */
export function isKpiWidget(obj: unknown): obj is IKpiWidget {
    return isWidget(obj) && (obj as IKpiWidget).type === "kpi";
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IKpiWidget}.
 * @alpha
 */
export function isKpiWidgetDefinition(obj: unknown): obj is IKpiWidgetDefinition {
    return isWidgetDefinition(obj) && (obj as IKpiWidget).type === "kpi";
}

/**
 * @internal
 */
function hasWidgetProps(obj: unknown): boolean {
    return !isEmpty(obj) && ((obj as IWidgetBase).type === "kpi" || (obj as IWidgetBase).type === "insight");
}

/**
 * Gets the widget identifier
 *
 * @param widget - widget to get identifier of
 * @returns the widget identifier
 * @alpha
 */
export function widgetId(widget: IWidget): string {
    invariant(widget, "widget to get identifier of must be specified");

    return widget.identifier;
}

/**
 * Gets the widget uri
 *
 * @param widget - widget to get uri of
 * @returns the widget uri
 * @alpha
 */
export function widgetUri(widget: IWidget): string {
    invariant(widget, "widget to get uri of must be specified");

    return widget.uri;
}

/**
 * Gets the widget ref
 *
 * @param widget - widget to get ref of
 * @returns the widget ref
 * @alpha
 */
export function widgetRef(widget: IWidget): ObjRef {
    invariant(widget, "widget to get ref of must be specified");

    return widget.ref;
}

/**
 * Gets the widget type
 *
 * @param widget - widget to get type of
 * @returns the widget type
 * @alpha
 */
export function widgetType(widget: IWidget): WidgetType {
    invariant(widget, "widget to get type of must be specified");

    return widget.type;
}

/**
 * Gets the widget title
 *
 * @param widget - widget to get title of
 * @returns the widget title
 * @alpha
 */
export function widgetTitle(widget: IWidget): string {
    invariant(widget, "widget to get title of must be specified");

    return widget.title;
}
