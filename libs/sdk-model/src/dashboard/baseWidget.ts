// (C) 2021-2024 GoodData Corporation
import { ObjRef } from "../objRef/index.js";
import { DrillDefinition, IDrillDownReference } from "./drill.js";
import { IDashboardFilterReference } from "./filterContext.js";

/**
 * Defines properties that are used for filterable widgets. Filterable widgets allow users to specify:
 *
 * -  Date data set that should be used for date-filtering the data for the widget
 * -  An ignore-list containing references to dashboard attribute filters that should be ignored by
 *    the widget.
 * -  Whether widget should ignore cross-filtering filters.
 *
 * @public
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

    /**
     * Ignore cross-filtering filters
     */
    readonly ignoreCrossFiltering?: boolean;
}

/**
 * Defines mapping between particular drill down hierarchy
 * and attributes to ignore in the intersection during the drill down for this hierarchy.
 *
 * @alpha
 */
export interface IDrillDownIntersectionIgnoredAttributes {
    /**
     * Local identifiers of the attribute display forms to ignore for the drill down intersection.
     */
    readonly ignoredAttributes: string[];

    /**
     * Drill down hierarchy reference for which the ignored attributes are defined.
     */
    readonly drillDownReference: IDrillDownReference;
}

/**
 * Defines properties that are used for drillable widgets. Such widgets allow user clicking on
 * different parts of the widget and through this interaction navigate to other insights or dashboards.
 *
 * @public
 */
export interface IDrillableWidget {
    /**
     * Widget drills
     */
    readonly drills: DrillDefinition[];

    /**
     * Ignore particular drill down hierarchies in the current widget
     * @alpha
     */
    readonly ignoredDrillDownHierarchies?: IDrillDownReference[];

    /**
     * List of mappings between drill down hierarchies
     * and attributes to ignore in the intersection during the drill down for this hierarchy.
     * @alpha
     */
    readonly drillDownIntersectionIgnoredAttributes?: IDrillDownIntersectionIgnoredAttributes[];
}

/**
 * Defines properties that are used to store widget's descriptive metadata.
 *
 * @public
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
 * @public
 */
export interface IBaseWidget {
    /**
     * Type of widget. This can be assigned by widget creator and can be any string up to 256 characters.
     *
     * @remarks see {@link BuiltInWidgetTypes} for list of built-in widget types.
     */
    readonly type: string;
    /**
     * Local identifier of widget
     */
    readonly localIdentifier?: string;
}

/**
 * List of built-in widget types. These type names are reserved and must not be used by custom widgets.
 *
 * @alpha
 */
export const BuiltInWidgetTypes: string[] = ["kpi", "insight", "richText", "visualizationSwitcher"];
