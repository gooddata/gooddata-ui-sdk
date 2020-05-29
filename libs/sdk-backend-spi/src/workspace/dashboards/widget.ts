// (C) 2020 GoodData Corporation
import { ObjRef, isObjRef } from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty";
import { IDashboardFilterReference } from "./filterContext";
import { DrillDefinition } from "./drills";
import { ILegacyKpi } from "./kpi";
import { IDashboardObjectIdentity } from "./common";

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
