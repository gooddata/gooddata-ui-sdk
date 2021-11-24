// (C) 2020-2021 GoodData Corporation
import { useMemo } from "react";
import stringify from "json-stable-stringify";
import { IInsightWidget } from "@gooddata/sdk-backend-spi";
import { insightSetFilters } from "@gooddata/sdk-model";
import {
    GoodDataSdkError,
    useBackendStrict,
    useWorkspaceStrict,
    UseCancelablePromiseState,
    useCancelablePromise,
    DataViewFacade,
    useExecutionDataView,
} from "@gooddata/sdk-ui";
import { useWidgetFilters, selectInsightByRef, useDashboardSelector } from "@gooddata/sdk-ui-dashboard";

interface IUseInsightWidgetDataView {
    /**
     * Insight widget to get data view for.
     *
     * Note: When the insight widget is not provided, hook is locked in a "pending" state.
     */
    insightWidget?: IInsightWidget;
}

/**
 * Hook that presents bare minimum code to get data view for particular insight widget,
 * with respect to current dashboard filters.
 *
 * @param config - configuration of the hook
 */
export function useInsightWidgetDataView(
    config: IUseInsightWidgetDataView,
): UseCancelablePromiseState<DataViewFacade, GoodDataSdkError> {
    const { insightWidget } = config;
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const insight = useDashboardSelector(selectInsightByRef(insightWidget?.insight));
    const widgetFiltersPromise = useWidgetFilters(insightWidget);

    const insightWithAddedFilters = useMemo(
        () => insightSetFilters(insight!, widgetFiltersPromise.result),
        [
            insight,
            /**
             * We use stringified value to avoid setting equal filters. This prevents cascading cache invalidation
             * and expensive re-renders down the line. The stringification is worth it as the filters are usually
             * pretty small thus saving more time than it is taking.
             */
            stringify(widgetFiltersPromise.result),
        ],
    );

    const insightWidgetExecutionPromise = useCancelablePromise(
        {
            promise:
                insightWithAddedFilters && insightWidget
                    ? async () => {
                          return backend.workspace(workspace).execution().forInsight(insightWithAddedFilters);
                      }
                    : null,
        },
        [backend, workspace, insightWithAddedFilters, insightWidget],
    );

    return useExecutionDataView({ execution: insightWidgetExecutionPromise.result });
}
