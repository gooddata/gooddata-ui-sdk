// (C) 2019-2023 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import isNil from "lodash/isNil.js";
import { DateFilterGranularity, DateString } from "../dateFilterConfig/index.js";
import { IAttributeElements, isAttributeElementsByRef } from "../execution/filter/index.js";
import { isObjRef, ObjRef } from "../objRef/index.js";
import { IDashboardObjectIdentity } from "./common.js";

/**
 * Date filter type - relative
 * @beta
 */
export type DateFilterRelativeType = "relative";

/**
 * Date filter type - absolute
 * @beta
 */
export type DateFilterAbsoluteType = "absolute";

/**
 * Date filter type - relative or absolute
 * @beta
 */
export type DateFilterType = DateFilterRelativeType | DateFilterAbsoluteType;

/**
 * Parent filter of an attribute filter of the filter context
 * @beta
 */
export interface IDashboardAttributeFilterParent {
    /**
     * Local identifier of the parent filter
     */
    filterLocalIdentifier: string;
    /**
     * Specification of the connection point(s) between the parent and child filter in the data model
     */
    over: {
        attributes: ObjRef[];
    };
}

/**
 * Attribute filter selection mode value
 * @beta
 */
export type DashboardAttributeFilterSelectionMode = "single" | "multi";

/**
 * Attribute filter of the filter context
 * @public
 */
export interface IDashboardAttributeFilter {
    attributeFilter: {
        /**
         * Display form object ref
         */
        displayForm: ObjRef;

        /**
         * Is negative filter?
         */
        negativeSelection: boolean;

        /**
         * Selected attribute elements
         * @beta
         */
        attributeElements: IAttributeElements;

        /**
         * Identifier of the filter which is valid in the scope of the filter context
         */
        localIdentifier?: string;

        /**
         * Parent filters that are limiting elements available in this filter
         * @beta
         */
        filterElementsBy?: IDashboardAttributeFilterParent[];

        /**
         * Custom title of the attribute filter. If specified has priority over the default attribute filter title.
         */
        title?: string;

        /**
         * Selection mode which defines how many elements can be in attributeElements.
         * Default value is 'multi' if property is missing.
         * @beta
         */
        selectionMode?: DashboardAttributeFilterSelectionMode;
    };
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDashboardAttributeFilter}.
 * @alpha
 */
export function isDashboardAttributeFilter(obj: unknown): obj is IDashboardAttributeFilter {
    return !isEmpty(obj) && !!(obj as IDashboardAttributeFilter).attributeFilter;
}

/**
 * Returns true when given filter has selection mode set to single
 * @alpha
 */
export function isSingleSelectionFilter(filter: IDashboardAttributeFilter): boolean {
    return filter.attributeFilter.selectionMode === "single";
}

/**
 * Returns true when given filter has negative selection
 * @alpha
 */
export function isNegativeAttributeFilter(filter: IDashboardAttributeFilter) {
    return !!filter.attributeFilter.negativeSelection;
}

/**
 * Returns count of selected elements
 * @alpha
 */
export function getSelectedElementsCount(filter: IDashboardAttributeFilter) {
    return isAttributeElementsByRef(filter.attributeFilter.attributeElements)
        ? filter.attributeFilter.attributeElements.uris.length
        : filter.attributeFilter.attributeElements.values.length;
}

/**
 * Date filter of the filter context
 * @public
 */
export interface IDashboardDateFilter {
    dateFilter: {
        /**
         * Date filter type - relative or absolute
         * @beta
         */
        type: DateFilterType;

        /**
         * Date filter granularity
         * @beta
         */
        granularity: DateFilterGranularity;

        /**
         * Filter - from
         * @beta
         */
        from?: DateString | number;

        /**
         * Filter - to
         * @beta
         */
        to?: DateString | number;

        /**
         * DateDataSet object ref
         */
        dataSet?: ObjRef;

        /**
         * Date attribute object ref
         */
        attribute?: ObjRef;
    };
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDashboardDateFilter}.
 * @alpha
 */
export function isDashboardDateFilter(obj: unknown): obj is IDashboardDateFilter {
    return !isEmpty(obj) && !!(obj as IDashboardDateFilter).dateFilter;
}

/**
 * Returns true when given date filter has type set to relative.
 * @alpha
 */
export function isRelativeDashboardDateFilter(dateFilter: IDashboardDateFilter): boolean {
    return dateFilter.dateFilter.type === "relative";
}

/**
 * Returns true when given date filter has type set to absolute.
 * @alpha
 */
export function isAbsoluteDashboardDateFilter(dateFilter: IDashboardDateFilter): boolean {
    return dateFilter.dateFilter.type === "absolute";
}

/**
 * Creates a new relative dashboard date filter.
 *
 * @param granularity - granularity of the filters (month, year, etc.)
 * @param from - start of the interval – negative numbers mean the past, zero means today, positive numbers mean the future
 * @param to - end of the interval – negative numbers mean the past, zero means today, positive numbers mean the future
 * @alpha
 */
export function newRelativeDashboardDateFilter(
    granularity: DateFilterGranularity,
    from: number,
    to: number,
): IDashboardDateFilter {
    return {
        dateFilter: {
            type: "relative",
            granularity,
            from,
            to,
        },
    };
}

/**
 * Creates a new absolute dashboard date filter.
 *
 * @param from - start of the interval in ISO-8601 calendar date format
 * @param to - end of the interval in ISO-8601 calendar date format
 * @alpha
 */
export function newAbsoluteDashboardDateFilter(from: DateString, to: DateString): IDashboardDateFilter {
    return {
        dateFilter: {
            type: "absolute",
            granularity: "GDC.time.date",
            from,
            to,
        },
    };
}

/**
 * Creates a new all time date filter. This filter is used to indicate that there should be no filtering on the dates.
 *
 * @alpha
 */
export function newAllTimeDashboardDateFilter(): IDashboardDateFilter {
    return {
        dateFilter: {
            type: "relative",
            granularity: "GDC.time.date",
        },
    };
}

/**
 * Type-guard testing whether the provided object is an All time dashboard date filter.
 * @alpha
 */
export function isAllTimeDashboardDateFilter(obj: unknown): boolean {
    return isDashboardDateFilter(obj) && isNil(obj.dateFilter.from) && isNil(obj.dateFilter.to);
}

/**
 * Supported filter context items
 * @alpha
 */
export type FilterContextItem = IDashboardAttributeFilter | IDashboardDateFilter;

/**
 * Common filter context properties
 *
 * @alpha
 */
export interface IFilterContextBase {
    /**
     * Filter context title
     */
    readonly title: string;

    /**
     * Filter context description
     */
    readonly description: string;

    /**
     * Attribute or date filters
     */
    readonly filters: FilterContextItem[];
}

/**
 * Filter context definition represents modifier or created filter context
 *
 * @alpha
 */
export interface IFilterContextDefinition extends IFilterContextBase, Partial<IDashboardObjectIdentity> {}

/**
 * Type-guard testing whether the provided object is an instance of {@link IFilterContextDefinition}.
 * @alpha
 */
export function isFilterContextDefinition(obj: unknown): obj is IFilterContextDefinition {
    // Currently, we have no better way to distinguish between IFilterContext and ITempFilterContext
    return hasFilterContextBaseProps(obj) && !isObjRef((obj as any).ref);
}

/**
 * Filter context consists of configured attribute and date filters
 * (which could be applied to the dashboard, widget alert, or scheduled email)
 *
 * @alpha
 */
export interface IFilterContext extends IFilterContextBase, IDashboardObjectIdentity {}

/**
 * Type-guard testing whether the provided object is an instance of {@link IFilterContext}.
 * @alpha
 */
export function isFilterContext(obj: unknown): obj is IFilterContext {
    // Currently, we have no better way to distinguish between IFilterContext and ITempFilterContext
    return hasFilterContextBaseProps(obj) && isObjRef((obj as any).ref);
}

/**
 * Temporary filter context serves to override original dashboard filter context during the dashboard export
 *
 * @alpha
 */
export interface ITempFilterContext {
    /**
     * Filter context created time
     * YYYY-MM-DD HH:mm:ss
     */
    readonly created: string;

    /**
     * Attribute or date filters
     */
    readonly filters: FilterContextItem[];

    /**
     * Temp filter context ref
     */
    readonly ref: ObjRef;

    /**
     * Temp filter context uri
     */
    readonly uri: string;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link ITempFilterContext}.
 * @alpha
 */
export function isTempFilterContext(obj: unknown): obj is ITempFilterContext {
    // Currently, we have no better way to distinguish between IFilterContext and ITempFilterContext
    return (
        hasFilterContextBaseProps(obj) &&
        isObjRef((obj as any).ref) &&
        !(obj as IFilterContext).identifier &&
        !(obj as IFilterContext).title
    );
}

/**
 * Reference to a particular dashboard date filter
 * This is commonly used to define filters to ignore
 * for the particular dashboard widget
 *
 * @alpha
 */
export interface IDashboardDateFilterReference {
    /**
     * Dashboard filter reference type
     */
    type: "dateFilterReference";

    /**
     * DataSet reference of the target date filter
     */
    dataSet: ObjRef;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDashboardDateFilterReference}.
 * @alpha
 */
export function isDashboardDateFilterReference(obj: unknown): obj is IDashboardDateFilterReference {
    return !isEmpty(obj) && (obj as IDashboardDateFilterReference).type === "dateFilterReference";
}

/**
 * Reference to a particular dashboard attribute filter
 * This is commonly used to define filters to ignore
 * for the particular dashboard widget
 *
 * @alpha
 */
export interface IDashboardAttributeFilterReference {
    /**
     * Dashboard filter reference type
     */
    type: "attributeFilterReference";

    /**
     * Attribute display form reference of the target attribute filter
     */
    displayForm: ObjRef;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDashboardAttributeFilterReference}.
 * @alpha
 */
export function isDashboardAttributeFilterReference(obj: unknown): obj is IDashboardAttributeFilterReference {
    return !isEmpty(obj) && (obj as IDashboardAttributeFilterReference).type === "attributeFilterReference";
}

/**
 * Reference to a particular dashboard filter
 * This is commonly used to define filters to ignore
 * for the particular dashboard widget
 *
 * @alpha
 */
export type IDashboardFilterReference = IDashboardDateFilterReference | IDashboardAttributeFilterReference;

/**
 * Gets reference to object being used for filtering. For attribute filters, this will be reference to the display
 * form. For date filters this will be reference to the data set.
 *
 * @alpha
 */
export function dashboardFilterReferenceObjRef(ref: IDashboardFilterReference): ObjRef {
    return isDashboardAttributeFilterReference(ref) ? ref.displayForm : ref.dataSet;
}

/**
 * @internal
 */
function hasFilterContextBaseProps(obj: unknown): boolean {
    return !isEmpty(obj) && !!(obj as IFilterContextBase).filters;
}
