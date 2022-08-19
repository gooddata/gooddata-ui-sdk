// (C) 2020-2022 GoodData Corporation
import { useEffect, useMemo, useState } from "react";
import {
    areObjRefsEqual,
    filterObjRef,
    IFilter,
    IInsightDefinition,
    ObjRef,
    FilterContextItem,
    isDashboardAttributeFilter,
    attributeElementsIsEmpty,
} from "@gooddata/sdk-model";
import stringify from "json-stable-stringify";
import compact from "lodash/compact";
import first from "lodash/first";
import flow from "lodash/flow";
import isEqual from "lodash/isEqual";
import sortBy from "lodash/fp/sortBy";

import {
    ExtendedDashboardWidget,
    QueryProcessingState,
    QueryProcessingStatus,
    QueryWidgetFilters,
    queryWidgetFilters,
    selectFilterContextFilters,
    useDashboardQueryProcessing,
    useDashboardSelector,
} from "../../../model";
import { safeSerializeObjRef } from "../../../_staging/metadata/safeSerializeObjRef";

/**
 * Hook for obtaining the effective filters for a widget.
 *
 * @remarks
 * The filters returned should be used with {@link @gooddata/sdk-model#insightSetFilters} to obtain
 * insight that is ready for execution.
 *
 * @param widget - widget to get effective filters for
 * @param insight - insight to evaluate the filters for in context of the widget
 * @returns set of filters that should be used to execute the given widget
 *
 * @public
 */
export function useWidgetFilters(
    widget: ExtendedDashboardWidget | undefined,
    insight?: IInsightDefinition,
): QueryProcessingState<IFilter[]> {
    const [effectiveFiltersState, setEffectiveFiltersState] = useState<{
        filters: IFilter[];
        filterQueryStatus: QueryProcessingStatus;
    }>({
        filters: [],
        filterQueryStatus: "pending",
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
    } = useDashboardQueryProcessing<QueryWidgetFilters, IFilter[], Parameters<typeof queryWidgetFilters>>({
        queryCreator: queryWidgetFilters,
        onSuccess: (filters) => {
            setEffectiveFiltersState({
                filters,
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
        if (widget?.ref && nonIgnoredFiltersStatus === "success") {
            runFiltersQuery(widget.ref, insight);
        }
    }, [
        safeSerializeObjRef(widget?.ref),
        fullFiltersDigest(nonIgnoredFilters),
        insight,
        nonIgnoredFiltersStatus,
    ]);

    return {
        result: effectiveFiltersState.filters,
        status: combineQueryProcessingStatuses(
            nonIgnoredFiltersStatus,
            effectiveFiltersState.filterQueryStatus,
            status,
        ),
        error: nonIgnoredFiltersError ?? error,
    } as QueryProcessingState<IFilter[]>;
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
        if (widget?.ref) {
            // force ignore the insight -> this way we get only the dashboard level filters even for InsightWidgets
            run(widget.ref, null);
        }
    }, [safeSerializeObjRef(widget?.ref), filtersDigest(dashboardFilters, widgetIgnoresDateFilter)]);

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
    pending: 4,
};

function combineQueryProcessingStatuses(...statuses: QueryProcessingStatus[]): QueryProcessingStatus {
    return (
        flow(
            compact,
            sortBy<QueryProcessingStatus>((status) => statusPriorities[status]),
            first,
        )(statuses) ?? "pending"
    );
}

/**
 * Gets a simplified serialized digest of the filters provided. This is useful for detecting if the set of filters has changed.
 *
 * @remarks
 * This digest is only concerned with the display forms/datasets, not the selected values of the filters
 * (it does, however, ignore noop attribute filters).
 * Also, the order of filters is ignored as it does not matter for executions.
 *
 * @param filters - filters to get digest for
 * @param ignoreDateFilter - whether to ignore date filters
 * @returns
 */
function filtersDigest(filters: FilterContextItem[], ignoreDateFilter: boolean): string {
    return filters
        .filter((filter) => {
            if (isDashboardAttributeFilter(filter)) {
                // remove noop attribute filters as they would cause a useless query when a new filter (noop by default) is added
                const isNoop =
                    filter.attributeFilter.negativeSelection &&
                    attributeElementsIsEmpty(filter.attributeFilter.attributeElements);

                return !isNoop;
            } else {
                // if the widget ignores date filters, remove it from the digest to avoid false positives
                // when date filter changes to or from All time (this effectively adds/removes the date filter in the filters set,
                // but we do not care either way, so remove it altogether)
                return !ignoreDateFilter;
            }
        })
        .map((filter) => {
            return isDashboardAttributeFilter(filter)
                ? `df_${safeSerializeObjRef(filter.attributeFilter.displayForm)}`
                : `ds_${safeSerializeObjRef(filter.dateFilter.dataSet)}`;
        })
        .sort()
        .join("|");
}

/**
 * Gets a serialized digest of the filters provided. This is useful for detecting if the set of filters has changed.
 *
 * @remarks
 * This digest also takes the selected values of the filters into account.
 * The order of filters is ignored as it does not matter for executions.
 *
 * @param filters - filters to get digest for
 * @returns
 */
function fullFiltersDigest(filters: FilterContextItem[]): string {
    return filters
        .map((filter) => stringify(filter))
        .sort()
        .join("|");
}
