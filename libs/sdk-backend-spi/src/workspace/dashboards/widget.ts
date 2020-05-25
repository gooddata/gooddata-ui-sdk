// (C) 2020 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty";
import { IWidgetAlert } from "./alert";
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

    /**
     * Widget alerts (currently, only kpi supports alerting)
     */
    readonly alerts: IWidgetAlert[];
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
    return (
        !isEmpty(obj) &&
        ((obj as IWidgetDefinition).type === "kpi" || (obj as IWidgetDefinition).type === "insight") &&
        !(obj as IWidget).ref
    );
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IWidget}.
 * @alpha
 */
export function isWidget(obj: any): obj is IWidget {
    return (
        !isEmpty(obj) &&
        ((obj as IWidget).type === "kpi" || (obj as IWidget).type === "insight") &&
        !!(obj as IWidget).ref
    );
}
