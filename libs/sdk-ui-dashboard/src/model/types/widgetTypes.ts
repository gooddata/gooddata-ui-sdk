// (C) 2021-2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type ObjRef } from "@gooddata/sdk-model";

/**
 * @beta
 */
export interface IWidgetHeader {
    /**
     * Title to set. If not defined then widget will have no title.
     */
    title?: string;
}

/**
 * @beta
 */
export interface IWidgetDescription {
    /**
     * Description to set. If not defined then widget will have no description.
     */
    description?: string;
}

/**
 * @internal
 */
export function isWidgetHeader(obj: unknown): obj is IWidgetHeader {
    return !isEmpty(obj) && (obj as IWidgetHeader).title !== undefined;
}

/**
 * @beta
 */
export type FilterOperations =
    | "enableDateFilter"
    | "disableDateFilter"
    | "replaceAttributeIgnores"
    | "ignoreAttributeFilter"
    | "unignoreAttributeFilter"
    | "ignoreDateFilter"
    | "unignoreDateFilter"
    | "replace";

/**
 * @beta
 */
export interface IFilterOp {
    readonly type: FilterOperations;
}

/**
 * This filter operation enables date filtering for the widget.
 *
 * A ref to date data set must be specified as it is passed down to widget content. Insights or KPIs can be typically
 * date-filtered using different date data sets and so this selection is essential.
 *
 * @beta
 */
export interface IFilterOpEnableDateFilter extends IFilterOp {
    type: "enableDateFilter";

    /**
     * Ref of date data set to use in date filters applied on the content of the widget.
     * If passed "default", the default date dataset will be resolved and used.
     */
    dateDataset: ObjRef | "default";
}

/**
 * This filter operation disabled date filtering for the widget.
 *
 * @beta
 */
export interface IFilterOpDisableDateFilter extends IFilterOp {
    type: "disableDateFilter";
}

/**
 * This filter operation replaces the setting which determines which of the dashboard's attribute filters
 * should be ignored for the widget.
 *
 * @beta
 */
export interface IFilterOpReplaceAttributeIgnores extends IFilterOp {
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
 * @beta
 */
export interface IFilterOpIgnoreAttributeFilter extends IFilterOp {
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
 * @beta
 */
export interface IFilterOpUnignoreAttributeFilter extends IFilterOp {
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
 * @beta
 */
export interface IFilterOpReplaceAll extends IFilterOp {
    type: "replace";

    /**
     * Dashboard filters to ignore for particular widget.
     *
     * Specify ObjRefs of display forms that are used by dashboard's attribute filters which you wish to disable.
     */
    readonly ignoreAttributeFilters?: ObjRef[];

    /**
     * Dashboard date filters to ignore for particular widget.
     *
     * Specify ObjRefs of date data sets that are used by dashboard's date filters which you wish to disable.
     */
    readonly ignoreDateFilters?: ObjRef[];

    /**
     * Date data set that will be used when constructing date filter for a widget.
     *
     * If the widget does not specify any dateDataSet, then no date filtering is applied to it.
     */
    readonly dateDatasetForFiltering?: ObjRef;
}

/**
 * This filter operation appends one or more date filters into the widget's filter ignore-list.
 *
 * @beta
 */
export interface IFilterOpIgnoreDateFilter extends IFilterOp {
    type: "ignoreDateFilter";

    /**
     * The date filters to add to ignore-list; specified using the refs of date data sets that are used during the
     * filtering.
     *
     * If the list is empty, then the operation will not change the filters in any way.
     * Attempting to add same attribute filter into the ignore list has no effect.
     */
    dateDataSetRefs: ObjRef[];
}

/**
 * This filter operation removes one or more date filters from the widget's filter ignore-list.
 *
 * @beta
 */
export interface IFilterOpUnignoreDateFilter extends IFilterOp {
    type: "unignoreDateFilter";

    /**
     * The attribute filters to remove from the ignore-list; specified using the refs of display forms that are
     * used during the filtering.
     *
     * If the list is empty, then the operation will not change the filters in any way.
     * Attempting to remove same attribute filter twice has no effect.
     */
    dateDataSetRefs: ObjRef[];
}

/**
 * Widget's filter settings can be manipulated using multiple different granular operations. This is the union
 * type containing all the available operations.
 *
 * @beta
 */
export type IWidgetFilterOperation =
    | IFilterOpEnableDateFilter
    | IFilterOpDisableDateFilter
    | IFilterOpReplaceAttributeIgnores
    | IFilterOpIgnoreAttributeFilter
    | IFilterOpUnignoreAttributeFilter
    | IFilterOpIgnoreDateFilter
    | IFilterOpUnignoreDateFilter
    | IFilterOpReplaceAll;
