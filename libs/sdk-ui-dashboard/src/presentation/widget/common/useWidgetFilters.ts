// (C) 2020-2021 GoodData Corporation
import { useEffect, useMemo, useState } from "react";
import {
    FilterContextItem,
    IInsightWidget,
    IKpiWidget,
    isDashboardAttributeFilter,
    isInsightWidget,
} from "@gooddata/sdk-backend-spi";
import { areObjRefsEqual, filterObjRef, IFilter, ObjRef } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import stringify from "json-stable-stringify";
import compact from "lodash/compact";
import first from "lodash/first";
import flow from "lodash/flow";
import isEqual from "lodash/isEqual";
import sortBy from "lodash/fp/sortBy";

import {
    ExtendedDashboardWidget,
    ICustomWidget,
    QueryProcessingStatus,
    queryWidgetFilters,
    selectFilterContextFilters,
    useDashboardQueryProcessing,
    useDashboardSelector,
} from "../../../model";

/**
 * Hook for obtaining the effective filters for a widget.
 *
 * @param widget - widget to get effective filters for
 * @returns set of filters that should be used to execute the given widget
 *
 * @alpha
 */
export function useWidgetFilters(widget: ICustomWidget | IKpiWidget | undefined): {
    result?: IFilter[];
    status?: QueryProcessingStatus;
    error?: GoodDataSdkError;
};
/**
 * Hook for obtaining the effective filters for a widget.
 *
 * @param widget - widget to get effective filters for
 * @param insightFilterOverrides - filters to use instead of the insight filters
 * @returns set of filters that should be used to execute the given widget
 *
 * @alpha
 */
export function useWidgetFilters(
    widget: IInsightWidget | undefined,
    insightFilterOverrides?: IFilter[],
): {
    result?: IFilter[];
    status?: QueryProcessingStatus;
    error?: GoodDataSdkError;
};
/**
 * Hook for obtaining the effective filters for a widget.
 *
 * @param widget - widget to get effective filters for
 * @param insightFilterOverrides - filters to use instead of the insight filters
 * @returns set of filters that should be used to execute the given widget
 *
 * @alpha
 */
export function useWidgetFilters(
    widget: ExtendedDashboardWidget | undefined,
    insightFilterOverrides?: IFilter[],
): {
    result?: IFilter[];
    status?: QueryProcessingStatus;
    error?: GoodDataSdkError;
} {
    const [effectiveFiltersState, setEffectiveFiltersState] = useState<{
        filters: IFilter[];
        filterQueryStatus?: QueryProcessingStatus;
    }>({
        filters: [],
        filterQueryStatus: undefined,
    });

    const {
        status: nonIgnoredFiltersStatus,
        error: nonIgnoredFiltersError,
        result: nonIgnoredFilters,
    } = useNonIgnoredFilters(widget);

    const {
        run: runFiltersQuery,
        status,
        error,
    } = useDashboardQueryProcessing({
        queryCreator: queryWidgetFilters,
        onSuccess: (result) => {
            setEffectiveFiltersState({
                filters: result as IFilter[],
                filterQueryStatus: "success",
            });
        },
        onBeforeRun: () => {
            setEffectiveFiltersState({
                filters: [],
                filterQueryStatus: "running",
            });
        },
        onRejected: () => {
            setEffectiveFiltersState({
                filters: [],
                filterQueryStatus: "rejected",
            });
        },
        onError: () => {
            setEffectiveFiltersState({
                filters: [],
                filterQueryStatus: "error",
            });
        },
    });

    // only run the "full" filters query if any of the non-ignored filters has changed
    useEffect(() => {
        if (widget && nonIgnoredFiltersStatus === "success") {
            runFiltersQuery(widget, insightFilterOverrides);
        }
    }, [widget, stringify(nonIgnoredFilters), insightFilterOverrides, nonIgnoredFiltersStatus]);

    return {
        result: effectiveFiltersState.filters,
        status: combineQueryProcessingStatuses(
            nonIgnoredFiltersStatus,
            effectiveFiltersState?.filterQueryStatus,
            status,
        ),
        error: nonIgnoredFiltersError ?? error,
    };
}

/**
 * Hook that retrieves the non-ignored dashboard level filters for a widget.
 *
 * @param widget - widget to get the non-ignored filters for
 */
function useNonIgnoredFilters(widget: ExtendedDashboardWidget | undefined) {
    const dashboardFilters = useDashboardSelector(selectFilterContextFilters);
    const widgetIgnoresDateFilter = !widget?.dateDataSet;

    const [nonIgnoredFilterRefs, setNonIgnoredFilterRefs] = useState<ObjRef[]>([]);

    /**
     * This handles cases where:
     * - the set of filters themselves has changed (new filters added/filters removed)
     * - widget itself has changed (potentially changing the ignore settings)
     *
     * Those are the only ways how the set of non-ignored filters can change.
     */
    const { run, status, error } = useDashboardQueryProcessing({
        queryCreator: queryWidgetFilters,
        onSuccess: (result) => {
            setNonIgnoredFilterRefs((prevValue) => {
                // only set state if the values really changed
                // this prevents the full query from running unnecessarily
                if (!isEqual(prevValue, result)) {
                    return (result as IFilter[]).map(filterObjRef) as ObjRef[];
                }
                return prevValue;
            });
        },
    });

    useEffect(() => {
        if (widget) {
            if (isInsightWidget(widget)) {
                // set [] as filter overrides to ignore filters on insights -> this way we get only the dashboard level filters
                run(widget, []);
            } else {
                run(widget);
            }
        }
    }, [widget, filtersDigest(dashboardFilters, widgetIgnoresDateFilter)]);

    const nonIgnoredFilters = useMemo(
        () =>
            dashboardFilters.filter((filter) => {
                if (isDashboardAttributeFilter(filter)) {
                    return nonIgnoredFilterRefs.some((validRef) =>
                        areObjRefsEqual(validRef, filter.attributeFilter.displayForm),
                    );
                } else {
                    return !widgetIgnoresDateFilter;
                }
            }),
        [dashboardFilters, nonIgnoredFilterRefs, widgetIgnoresDateFilter],
    );

    return {
        error,
        status,
        result: nonIgnoredFilters,
    };
}

// the lower the number, the more priority the status has
const statusPriorities: { [S in QueryProcessingStatus]: number } = {
    error: 0,
    rejected: 1,
    running: 2,
    success: 3,
};

function combineQueryProcessingStatuses(
    ...statuses: (QueryProcessingStatus | undefined)[]
): QueryProcessingStatus | undefined {
    return flow(
        compact,
        sortBy<QueryProcessingStatus>((status) => statusPriorities[status]),
        first,
    )(statuses);
}

/**
 * Gets a serialized digest of the filters provided. This is useful for detecting if the set of filters has changed.
 *
 * @remarks
 * This digest is only concerned with the display forms/datasets, not the selected values of the filters.
 *
 * @param filters - filters to get digest for
 * @param ignoreDateFilter - whether to ignore date filters
 * @returns
 */
function filtersDigest(filters: FilterContextItem[], ignoreDateFilter: boolean): string {
    const data = filters
        // if the widget ignores date filters, remove it from the digest to avoid false positives
        // when date filter changes to or from All time (this effectively adds/removes the date filter in the filters set,
        // but we do not care either way, so remove it altogether)
        .filter((filter) => !ignoreDateFilter || isDashboardAttributeFilter(filter))
        .map((filter) => {
            if (isDashboardAttributeFilter(filter)) {
                return {
                    displayForm: filter.attributeFilter.displayForm,
                };
            } else {
                return {
                    dataSet: filter.dateFilter.dataSet,
                };
            }
        });

    return stringify(data);
}
