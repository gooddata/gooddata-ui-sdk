// (C) 2021-2022 GoodData Corporation

import { ObjRef } from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty";

/**
 * @alpha
 */
export interface WidgetHeader {
    /**
     * Title to set. If not defined then widget will have no title.
     */
    title?: string;
}

/**
 * @internal
 */
export function isWidgetHeader(obj: unknown): obj is WidgetHeader {
    return !isEmpty(obj) && (obj as WidgetHeader).title !== undefined;
}

/**
 * @alpha
 */
export type FilterOperations =
    | "enableDateFilter"
    | "disableDateFilter"
    | "replaceAttributeIgnores"
    | "ignoreAttributeFilter"
    | "unignoreAttributeFilter"
    | "replace";

/**
 * @alpha
 */
export interface FilterOp {
    readonly type: FilterOperations;
}

/**
 * This filter operation enables date filtering for the widget.
 *
 * A ref to date data set must be specified as it is passed down to widget content. Insights or KPIs can be typically
 * date-filtered using different date data sets and so this selection is essential.
 *
 * @alpha
 */
export interface FilterOpEnableDateFilter extends FilterOp {
    type: "enableDateFilter";

    /**
     * Ref of date data set to use in date filters applied on the content of the widget.
     */
    dateDataset: ObjRef;
}

/**
 * This filter operation disabled date filtering for the widget.
 *
 * @alpha
 */
export interface FilterOpDisableDateFilter extends FilterOp {
    type: "disableDateFilter";
}

/**
 * This filter operation replaces the setting which determines which of the dashboard's attribute filters
 * should be ignored for the widget.
 *
 * @alpha
 */
export interface FilterOpReplaceAttributeIgnores extends FilterOp {
    type: "replaceAttributeIgnores";

    /**
     * The attribute filters to ignore; specified using the refs of display forms that are used during the
     * filtering.
     *
     * If the list of display forms is empty, then none of the dashboard's attribute filters will be ignored.
     */
    displayFormRefs: ObjRef[];
}

/**
 * This filter operation appends one or more attribute filters into the widget's filter ignore-list.
 *
 * @alpha
 */
export interface FilterOpIgnoreAttributeFilter extends FilterOp {
    type: "ignoreAttributeFilter";

    /**
     * The attribute filters to add to ignore-list; specified using the refs of display forms that are used during the
     * filtering.
     *
     * If the list is empty, then the operation will not change the filters in any way.
     * Attempting to add same attribute filter into the ignore list has no effect.
     */
    displayFormRefs: ObjRef[];
}

/**
 * This filter operation removes one or more attribute filters from the widget's filter ignore-list.
 *
 * @alpha
 */
export interface FilterOpUnignoreAttributeFilter extends FilterOp {
    type: "unignoreAttributeFilter";

    /**
     * The attribute filters to remove from the ignore-list; specified using the refs of display forms that are
     * used during the filtering.
     *
     * If the list is empty, then the operation will not change the filters in any way.
     * Attempting to remove same attribute filter twice has no effect.
     */
    displayFormRefs: ObjRef[];
}

/**
 *
 * This filter operation completely replaces widget's filter settings. Both date data set (and thus date filter) setting
 * and the attribute filter ignore list will be replaced using the parameters in the operation body.
 *
 * @alpha
 */
export interface FilterOpReplaceAll extends FilterOp {
    type: "replace";

    /**
     * Dashboard filters to ignore for particular widget.
     *
     * Specify ObjRefs of display forms that are used by dashboard's attribute filters which you wish to disable.
     */
    readonly ignoreAttributeFilters?: ObjRef[];

    /**
     * Date data set that will be used when constructing date filter for a widget.
     *
     * If the widget does not specify any dateDataSet, then no date filtering is applied to it.
     */
    readonly dateDatasetForFiltering?: ObjRef;
}

/**
 * Widget's filter settings can be manipulated using multiple different granular operations. This is the union
 * type containing all the available operations.
 *
 * @alpha
 */
export type WidgetFilterOperation =
    | FilterOpEnableDateFilter
    | FilterOpDisableDateFilter
    | FilterOpReplaceAttributeIgnores
    | FilterOpIgnoreAttributeFilter
    | FilterOpUnignoreAttributeFilter
    | FilterOpReplaceAll;
