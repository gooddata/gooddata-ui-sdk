// (C) 2020-2026 GoodData Corporation

import {
    newAbsoluteDateFilter,
    newAllTimeFilter,
    newArbitraryAttributeFilter,
    newMatchAttributeFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    newRelativeDateFilter,
} from "../execution/filter/factory.js";
import {
    type IAbsoluteDateFilter,
    type IArbitraryAttributeFilter,
    type IAttributeElements,
    type IAttributeElementsByRef,
    type IAttributeFilter,
    type IDateFilter,
    type IMatchAttributeFilter,
    type IMeasureValueFilter,
    type INegativeAttributeFilter,
    type IPositiveAttributeFilter,
    type IRelativeDateFilter,
    filterAttributeElements,
    filterObjRef,
    isArbitraryAttributeFilter,
    isAttributeFilter,
    isAttributeFilterWithSelection,
    isDateFilter,
    isMatchAttributeFilter,
    isMeasureValueFilter,
    isNegativeAttributeFilter,
} from "../execution/filter/index.js";
import { type IAttributeElement } from "../ldm/attributeElement.js";
import { type ObjRef } from "../objRef/index.js";

import { type IFilterableWidget } from "./baseWidget.js";
import {
    type DashboardAttributeFilterItem,
    type DashboardAttributeFilterSelectionMode,
    type FilterContextItem,
    type IDashboardArbitraryAttributeFilter,
    type IDashboardAttributeFilter,
    type IDashboardDateFilter,
    type IDashboardMatchAttributeFilter,
    type IDashboardMeasureValueFilter,
    type IFilterContext,
    type IFilterContextDefinition,
    type ITempFilterContext,
    isAllTimeDashboardDateFilter,
    isDashboardArbitraryAttributeFilter,
    isDashboardAttributeFilterItem,
    isDashboardDateFilter,
    isDashboardMatchAttributeFilter,
    isDashboardMeasureValueFilter,
} from "./filterContext.js";
import { type IWidgetDefinition } from "./widget.js";

/**
 * Execution-filter form of a dashboard filter: what a {@link FilterContextItem} becomes once it is
 * resolved against the object it filters.
 *
 * @public
 */
export type IDashboardFilter =
    | IAbsoluteDateFilter
    | IRelativeDateFilter
    | IPositiveAttributeFilter
    | INegativeAttributeFilter
    | IArbitraryAttributeFilter
    | IMatchAttributeFilter
    | IMeasureValueFilter;

/**
 * Type-guard testing whether the provided object is an instance of {@link IDashboardFilter}.
 *
 * @public
 */
export function isDashboardFilter(obj: unknown): obj is IDashboardFilter {
    return isAttributeFilter(obj) || isDateFilter(obj) || isMeasureValueFilter(obj);
}

/**
 * Gets {@link IDashboardFilter} items for filters specified in given filterContext in relation to the given widget.
 *
 * @param filterContext - filter context to get filters for
 * @param widget - widget to use to get dateDataSet for date filters
 * @alpha
 */
export function filterContextToDashboardFiltersByWidget(
    filterContext: IFilterContextDefinition | IFilterContext | ITempFilterContext | undefined,
    widget: IWidgetDefinition,
): IDashboardFilter[] {
    if (!filterContext) {
        return [];
    }

    return filterContextItemsToDashboardFiltersByWidget(filterContext.filters, widget);
}

/**
 * Gets {@link IDashboardFilter} items for filters specified in given filterContext in relation to the
 * given dateDataSet.
 *
 * @param filterContext - filter context to get filters for
 * @param dateDataSet - widget to use to get dateDataSet for date filters
 * @alpha
 */
export function filterContextToDashboardFiltersByDateDataSet(
    filterContext: IFilterContextDefinition | IFilterContext | ITempFilterContext | undefined,
    dateDataSet: ObjRef,
): IDashboardFilter[] {
    if (!filterContext) {
        return [];
    }

    return filterContextItemsToDashboardFiltersByDateDataSet(filterContext.filters, dateDataSet);
}

/**
 * Converts {@link IDashboardAttributeFilter} to {@link IAttributeFilter} instance.
 *
 * @param filter - filter context attribute filter to convert
 * @deprecated Use {@link dashboardAttributeFilterItemToAttributeFilter} instead,
 * which supports all attribute filter types including text filters.
 * @public
 */
export function dashboardAttributeFilterToAttributeFilter(
    filter: IDashboardAttributeFilter,
): IAttributeFilter {
    if (filter.attributeFilter.negativeSelection) {
        return newNegativeAttributeFilter(
            filter.attributeFilter.displayForm,
            filter.attributeFilter.attributeElements,
            filter.attributeFilter.localIdentifier,
        );
    }

    return newPositiveAttributeFilter(
        filter.attributeFilter.displayForm,
        filter.attributeFilter.attributeElements,
        filter.attributeFilter.localIdentifier,
    );
}

/**
 * Converts any {@link DashboardAttributeFilterItem} to {@link IAttributeFilter} instance.
 *
 * @remarks
 * Handles all attribute filter types: element-based (positive/negative selection),
 * arbitrary value filters, and match (text) filters.
 *
 * @param filter - dashboard attribute filter item to convert
 * @alpha
 */
export function dashboardAttributeFilterItemToAttributeFilter(
    filter: DashboardAttributeFilterItem,
): IAttributeFilter {
    if (isDashboardArbitraryAttributeFilter(filter)) {
        const { displayForm, values, negativeSelection, localIdentifier } = filter.arbitraryAttributeFilter;
        return newArbitraryAttributeFilter(displayForm, values, negativeSelection, localIdentifier);
    }
    if (isDashboardMatchAttributeFilter(filter)) {
        const { displayForm, operator, literal, caseSensitive, negativeSelection, localIdentifier } =
            filter.matchAttributeFilter;
        return newMatchAttributeFilter(
            displayForm,
            operator,
            literal,
            { caseSensitive, negativeSelection },
            localIdentifier,
        );
    }

    if (filter.attributeFilter.negativeSelection) {
        return newNegativeAttributeFilter(
            filter.attributeFilter.displayForm,
            filter.attributeFilter.attributeElements,
            filter.attributeFilter.localIdentifier,
        );
    }

    return newPositiveAttributeFilter(
        filter.attributeFilter.displayForm,
        filter.attributeFilter.attributeElements,
        filter.attributeFilter.localIdentifier,
    );
}

/**
 * Converts {@link IAttributeFilter} to {@link DashboardAttributeFilterItem}.
 *
 * @remarks
 * For arbitrary and match filters, returns the corresponding dedicated dashboard filter type
 * with full lossless conversion. For element-based filters, returns {@link IDashboardAttributeFilter}.
 *
 * @alpha
 * @param filter - filter to convert
 * @param localIdentifier - localIdentifier of the filter
 * @param title - custom title of the filter
 * @param attributeElements - currently selected elements. Only used for element-based filters.
 * @param isInverted - whether filter has negative selection (NOT_IN operator). Default is taken from the filter param.
 * @param selectionMode - selection mode of the filter (single / multi). Default is undefined.
 * @returns converted filter
 */
export function attributeFilterToDashboardAttributeFilter(
    filter: IAttributeFilter,
    localIdentifier: string | undefined,
    title: string | undefined,
    attributeElements?: IAttributeElement[],
    isInverted?: boolean,
    selectionMode?: DashboardAttributeFilterSelectionMode,
): DashboardAttributeFilterItem {
    if (isArbitraryAttributeFilter(filter)) {
        const result: IDashboardArbitraryAttributeFilter = {
            arbitraryAttributeFilter: {
                displayForm: filterObjRef(filter),
                values: filter.arbitraryAttributeFilter.values,
                negativeSelection: filter.arbitraryAttributeFilter.negativeSelection ?? false,
                localIdentifier,
                title,
            },
        };
        return result;
    }

    if (isMatchAttributeFilter(filter)) {
        const result: IDashboardMatchAttributeFilter = {
            matchAttributeFilter: {
                displayForm: filterObjRef(filter),
                operator: filter.matchAttributeFilter.operator,
                literal: filter.matchAttributeFilter.literal,
                caseSensitive: filter.matchAttributeFilter.caseSensitive,
                negativeSelection: filter.matchAttributeFilter.negativeSelection ?? false,
                localIdentifier,
                title,
            },
        };
        return result;
    }

    const attributeElementsObj: IAttributeElementsByRef | undefined = attributeElements && {
        uris: attributeElements.map((element) => element.uri),
    };

    let resolvedElements: IAttributeElements | undefined = attributeElementsObj;
    if (!resolvedElements && isAttributeFilterWithSelection(filter)) {
        resolvedElements = filterAttributeElements(filter);
    }

    return {
        attributeFilter: {
            attributeElements: resolvedElements ?? { values: [] },
            displayForm: filterObjRef(filter),
            negativeSelection: isInverted ?? isNegativeAttributeFilter(filter),
            localIdentifier,
            title,
            selectionMode,
        },
    };
}

/**
 * Converts {@link IDashboardDateFilter} to {@link IDateFilter} instance.
 *
 * @param filter - filter context attribute filter to convert
 * @param widget - widget to use to get dateDataSet for date filters
 * @public
 */
export function dashboardDateFilterToDateFilterByWidget(
    filter: IDashboardDateFilter,
    widget?: Partial<IFilterableWidget>,
): IDateFilter {
    if (isAllTimeDashboardDateFilter(filter)) {
        const dataSet = widget
            ? filter.dateFilter.dataSet || widget.dateDataSet!
            : filter.dateFilter.dataSet!;
        return newAllTimeFilter(
            dataSet,
            filter.dateFilter.localIdentifier,
            filter.dateFilter.emptyValueHandling,
        );
    }

    if (filter.dateFilter.type === "relative") {
        return newRelativeDateFilter(
            widget ? filter.dateFilter.dataSet || widget.dateDataSet! : filter.dateFilter.dataSet!,
            filter.dateFilter.granularity,
            numberOrStringToNumber(filter.dateFilter.from!),
            numberOrStringToNumber(filter.dateFilter.to!),
            filter.dateFilter.localIdentifier,
            filter.dateFilter.boundedFilter,
            filter.dateFilter.emptyValueHandling,
        );
    } else {
        return newAbsoluteDateFilter(
            widget ? filter.dateFilter.dataSet || widget.dateDataSet! : filter.dateFilter.dataSet!,
            filter.dateFilter.from!.toString(),
            filter.dateFilter.to!.toString(),
            filter.dateFilter.localIdentifier,
            filter.dateFilter.emptyValueHandling,
        );
    }
}

/**
 * Converts {@link IDashboardDateFilter} to {@link IDateFilter} instance.
 *
 * @param filter - filter context attribute filter to convert
 * @param dateDataSet - date data set to define {@link IDateFilter}
 * @public
 */
export function dashboardDateFilterToDateFilterByDateDataSet(
    filter: IDashboardDateFilter,
    dateDataSet: ObjRef,
): IDateFilter {
    if (isAllTimeDashboardDateFilter(filter)) {
        return newAllTimeFilter(
            dateDataSet,
            filter.dateFilter.localIdentifier,
            filter.dateFilter.emptyValueHandling,
        );
    }

    if (filter.dateFilter.type === "relative") {
        return newRelativeDateFilter(
            dateDataSet,
            filter.dateFilter.granularity,
            numberOrStringToNumber(filter.dateFilter.from!),
            numberOrStringToNumber(filter.dateFilter.to!),
            filter.dateFilter.localIdentifier,
            filter.dateFilter.boundedFilter,
            filter.dateFilter.emptyValueHandling,
        );
    } else {
        return newAbsoluteDateFilter(
            dateDataSet,
            filter.dateFilter.from!.toString(),
            filter.dateFilter.to!.toString(),
            filter.dateFilter.localIdentifier,
            filter.dateFilter.emptyValueHandling,
        );
    }
}

/**
 * Converts {@link IDashboardMeasureValueFilter} to {@link IMeasureValueFilter} instance.
 *
 * @remarks
 * Dashboard measure value filters always reference a catalog metric via `ObjRef`, which is a valid
 * `ObjRefInScope`. When dashboard-level dimensionality is configured, it is passed through to the
 * execution filter; otherwise the backend derives granularity from the widget automatically.
 * Conditions are passed through unchanged.
 *
 * @param filter - dashboard measure value filter to convert
 * @alpha
 */
export function dashboardMeasureValueFilterToMeasureValueFilter(
    filter: IDashboardMeasureValueFilter,
): IMeasureValueFilter {
    const { measure, localIdentifier, conditions, dimensionality } = filter.dashboardMeasureValueFilter;
    return {
        measureValueFilter: {
            measure,
            localIdentifier,
            ...(conditions && conditions.length > 0 ? { conditions } : {}),
            ...(dimensionality && dimensionality.length > 0 ? { dimensionality } : {}),
        },
    };
}

/**
 * Gets {@link IDashboardFilter} items for filters specified as {@link FilterContextItem} instances.
 *
 * @param filterContextItems - filter context items to get filters for
 * @param widget - widget to use to get dateDataSet for date filters
 * @alpha
 */
export function filterContextItemsToDashboardFiltersByWidget(
    filterContextItems: FilterContextItem[],
    widget?: Partial<IFilterableWidget>,
): IDashboardFilter[] {
    return filterContextItems
        .filter(
            (
                filter,
            ): filter is DashboardAttributeFilterItem | IDashboardDateFilter | IDashboardMeasureValueFilter =>
                isDashboardAttributeFilterItem(filter) ||
                isDashboardDateFilter(filter) ||
                isDashboardMeasureValueFilter(filter),
        )
        .map((filter) => {
            if (isDashboardAttributeFilterItem(filter)) {
                return dashboardAttributeFilterItemToAttributeFilter(filter);
            }
            if (isDashboardMeasureValueFilter(filter)) {
                return dashboardMeasureValueFilterToMeasureValueFilter(filter);
            }
            return dashboardDateFilterToDateFilterByWidget(filter, widget);
        });
}

/**
 * Gets {@link IDashboardFilter} items for filters specified as {@link FilterContextItem} instances.
 *
 * @param filterContextItems - filter context items to get filters for
 * @param widget - widget to use to get dateDataSet for date filters
 * @alpha
 */
export function filterContextItemsToDashboardFiltersByRichTextWidget(
    filterContextItems: FilterContextItem[],
    widget?: Partial<IFilterableWidget>,
): IDashboardFilter[] {
    return filterContextItems
        .filter(
            (
                filter,
            ): filter is DashboardAttributeFilterItem | IDashboardDateFilter | IDashboardMeasureValueFilter =>
                isDashboardAttributeFilterItem(filter) ||
                isDashboardDateFilter(filter) ||
                isDashboardMeasureValueFilter(filter),
        )
        .map((filter) => {
            if (isDashboardAttributeFilterItem(filter)) {
                return dashboardAttributeFilterItemToAttributeFilter(filter);
            }
            if (isDashboardMeasureValueFilter(filter)) {
                return dashboardMeasureValueFilterToMeasureValueFilter(filter);
            }
            return dashboardDateFilterToDateFilterByWidget(filter, widget);
        })
        .filter(Boolean) as IDashboardFilter[];
}

/**
 * Gets {@link IDashboardFilter} items for filters specified as {@link FilterContextItem} instances.
 *
 * @param filterContextItems - filter context items to get filters for
 * @param dateDataSet - date data set to define {@link IDateFilter}
 * @alpha
 */
export function filterContextItemsToDashboardFiltersByDateDataSet(
    filterContextItems: FilterContextItem[],
    dateDataSet: ObjRef,
): IDashboardFilter[] {
    return filterContextItems
        .filter(
            (
                filter,
            ): filter is DashboardAttributeFilterItem | IDashboardDateFilter | IDashboardMeasureValueFilter =>
                isDashboardAttributeFilterItem(filter) ||
                isDashboardDateFilter(filter) ||
                isDashboardMeasureValueFilter(filter),
        )
        .map((filter) => {
            if (isDashboardAttributeFilterItem(filter)) {
                return dashboardAttributeFilterItemToAttributeFilter(filter);
            }
            if (isDashboardMeasureValueFilter(filter)) {
                return dashboardMeasureValueFilterToMeasureValueFilter(filter);
            }
            return dashboardDateFilterToDateFilterByDateDataSet(filter, dateDataSet);
        });
}

function numberOrStringToNumber(input: number | string): number {
    return typeof input === "string" ? Number.parseInt(input) : input;
}
