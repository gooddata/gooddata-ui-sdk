// (C) 2021-2022 GoodData Corporation
import { ObjRef } from "../objRef/index.js";
import { DrillDefinition } from "./drill.js";
import { IDashboardFilterReference } from "./filterContext.js";

/**
 * Defines properties that are used for filterable widgets. Filterable widgets allow users to specify:
 *
 * -  Date data set that should be used for date-filtering the data for the widget
 * -  An ignore-list containing references to dashboard attribute filters that should be ignored by
 *    the widget.
 *
 * @alpha
 */
export interface IFilterableWidget {
    /**
     * Ignore particular dashboard filters in the current widget
     */
    readonly ignoreDashboardFilters: IDashboardFilterReference[];

    /**
     * Date data set widget is connected to
     */
    readonly dateDataSet?: ObjRef;
}

/**
 * Defines properties that are used for drillable widgets. Such widgets allow user clicking on
 * different parts of the widget and through this interaction navigate to other insights or dashboards.
 *
 * @alpha
 */
export interface IDrillableWidget {
    /**
     * Widget drills
     */
    readonly drills: DrillDefinition[];
}

/**
 * Defines properties that are used to store widget's descriptive metadata.
 *
 * @alpha
 */
export interface IWidgetDescription {
    /**
     * Widget title
     */
    readonly title: string;

    /**
     * Widget description
     */
    readonly description: string;
}

/**
 * Base type for dashboard widgets.
 *
 * @alpha
 */
export interface IBaseWidget {
    /**
     * Type of widget. This can be assigned by widget creator and can be any string up to 256 characters.
     *
     * @remarks see {@link BuiltInWidgetTypes} for list of built-in widget types.
     */
    readonly type: string;
}

/**
 * List of built-in widget types. These type names are reserved and must not be used by custom widgets.
 *
 * @alpha
 */
export const BuiltInWidgetTypes: string[] = ["kpi", "insight"];
