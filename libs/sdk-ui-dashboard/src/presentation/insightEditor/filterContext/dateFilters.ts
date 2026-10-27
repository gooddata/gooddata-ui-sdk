// (C) 2020-2026 GoodData Corporation

import { type DateFilterItem } from "@gooddata/sdk-embedding";
import {
    type IDashboardDateFilter,
    type IDateFilter,
    type IFilter,
    type IInsight,
    type IRelativeDateFilter,
    type IWidget,
    type ObjRef,
    absoluteDateFilterValues,
    areObjRefsEqual,
    filterObjRef,
    insightFilters,
    isAbsoluteDateFilter,
    isAllTimeDateFilter,
    isDateFilter,
    isRelativeDateFilter,
    relativeDateFilterValues,
} from "@gooddata/sdk-model";
const ALL_TIME_GRANULARITY = "ALL_TIME_GRANULARITY";

function getDateFilterItem(
    dataSet: ObjRef,
    dateFilterContextItem: IDashboardDateFilter | undefined,
): DateFilterItem {
    if (dateFilterContextItem) {
        if (dateFilterContextItem.dateFilter.type === "absolute") {
            return {
                absoluteDateFilter: {
                    dataSet,
                    from: String(dateFilterContextItem.dateFilter.from),
                    to: String(dateFilterContextItem.dateFilter.to),
                },
            };
        } else {
            const boundedFilter = dateFilterContextItem.dateFilter.boundedFilter;
            return {
                relativeDateFilter: {
                    dataSet,
                    granularity: dateFilterContextItem.dateFilter.granularity,
                    from: Number(dateFilterContextItem.dateFilter.from),
                    to: Number(dateFilterContextItem.dateFilter.to),
                    ...(boundedFilter ? { boundedFilter } : {}),
                },
            };
        }
    } else {
        return {
            relativeDateFilter: {
                dataSet,
                granularity: ALL_TIME_GRANULARITY,
                from: -1,
                to: 1,
            },
        };
    }
}

export function getWidgetDateFilterItem(
    widget: IWidget,
    dateFilterContextItem: IDashboardDateFilter | undefined,
): DateFilterItem | undefined {
    if (!widget?.dateDataSet) {
        return undefined;
    }
    return getDateFilterItem(widget.dateDataSet, dateFilterContextItem);
}

const sanitizeCorruptedAllTimeFilters = (appliedDateFilter: IDateFilter) => {
    if (!isRelativeDateFilter(appliedDateFilter)) {
        return appliedDateFilter;
    }
    // A corrupted all time filter misses its bounds, although the type requires them.
    const { from, to, dataSet } = appliedDateFilter.relativeDateFilter as {
        from?: number;
        to?: number;
        dataSet: ObjRef;
    };
    if (from === undefined || to === undefined) {
        const relativeAllTimeDateFilter: IRelativeDateFilter = {
            relativeDateFilter: {
                dataSet,
                granularity: ALL_TIME_GRANULARITY,
                from: 0,
                to: 0,
            },
        };

        return relativeAllTimeDateFilter;
    } else {
        return appliedDateFilter;
    }
};

function getDateFilterContext(dateFilter: IDateFilter): DateFilterItem {
    const includeDataSet = true;
    if (isAllTimeDateFilter(dateFilter)) {
        const { dataSet } = relativeDateFilterValues(dateFilter, includeDataSet);

        return {
            relativeDateFilter: {
                dataSet,
                granularity: ALL_TIME_GRANULARITY,
                from: -1,
                to: 1,
            },
        };
    } else if (isAbsoluteDateFilter(dateFilter)) {
        const { dataSet, from, to } = absoluteDateFilterValues(dateFilter, includeDataSet);

        return {
            absoluteDateFilter: {
                dataSet,
                from,
                to,
            },
        };
    } else {
        const { dataSet, from, to, granularity, boundedFilter } = relativeDateFilterValues(
            dateFilter,
            includeDataSet,
        );
        return {
            relativeDateFilter: {
                dataSet,
                granularity,
                from,
                to,
                ...(boundedFilter ? { boundedFilter } : {}),
            },
        };
    }
}

export function getDateFilterItems(appliedFilters: IFilter[], insight: IInsight): DateFilterItem[] {
    const sanitizedAppliedDateFilters = appliedFilters
        .filter(isDateFilter)
        .map(sanitizeCorruptedAllTimeFilters);
    const insightDateFilters = insightFilters(insight).filter(isDateFilter);

    return getDateFilterItemsFromAppliedFilters(sanitizedAppliedDateFilters, insightDateFilters);
}

function getDateFilterItemsFromAppliedFilters(
    appliedFilters: IDateFilter[],
    insightDateFilters: IDateFilter[],
): DateFilterItem[] {
    const uniqueInsightDateFilters = insightDateFilters.filter((insightDateFilter) => {
        return !appliedFilters.some((appliedFilter) => {
            return areObjRefsEqual(filterObjRef(appliedFilter), filterObjRef(insightDateFilter));
        });
    });
    const allDateFilters = [...appliedFilters, ...uniqueInsightDateFilters];

    return allDateFilters.map((dateFilter): DateFilterItem => getDateFilterContext(dateFilter));
}
