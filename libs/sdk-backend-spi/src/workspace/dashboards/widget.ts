// (C) 2020 GoodData Corporation
import { ObjRef, isObjRef, ObjectType, CatalogItem } from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty";
import { IDashboardFilterReference } from "./filterContext";
import { DrillDefinition } from "./drills";
import { ILegacyKpi } from "./kpi";
import { IDashboardObjectIdentity } from "./common";
import invariant from "ts-invariant";

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
     * Widget insight object reference (when widget is not kpi)
     */
    readonly insight?: ObjRef;

    /**
     * Temporary place for legacy kpi properties
     */
    readonly kpi?: ILegacyKpi;

    /**
     * Widget drills
     */
    readonly drills: DrillDefinition[];
}

/**
 * See {@link IWidget}]
 * @alpha
 */
export interface IWidgetDefinition extends IWidgetBase, Partial<IDashboardObjectIdentity> {}

/**
 * @alpha
 */
export interface IWidget extends IWidgetBase, IDashboardObjectIdentity {}

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
export function isWidgetDefinition(obj: any): obj is IWidgetDefinition {
    return hasWidgetProps(obj) && !isObjRef(obj.ref);
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IWidget}.
 * @alpha
 */
export function isWidget(obj: any): obj is IWidget {
    return hasWidgetProps(obj) && isObjRef(obj.ref);
}

/**
 * @internal
 */
function hasWidgetProps(obj: any): boolean {
    return !isEmpty(obj) && ((obj as IWidgetBase).type === "kpi" || (obj as IWidgetBase).type === "insight");
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
