// (C) 2022 GoodData Corporation
import { IInsightWidget } from "@gooddata/sdk-backend-spi";
import {
    DataViewFacade,
    GoodDataSdkError,
    useBackendStrict,
    useCancelablePromise,
    UseCancelablePromiseState,
    useExecutionDataView,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";
import { useMemo } from "react";
import { IFilter, insightSetFilters } from "@gooddata/sdk-model";
import stringify from "json-stable-stringify";
import { selectInsightByRef, useDashboardSelector } from "../../../model";
import { useWidgetFilters } from "./useWidgetFilters";

/**
 * Configuration for the `useInsightWidgetDataView` hook.
 *
 * @public
 */
export interface IUseInsightWidgetDataView {
    /**
     * Insight widget to get data view for.
     *
     * Note: When the insight widget is not provided, hook is locked in a "pending" state.
     */
    insightWidget?: IInsightWidget;

    /**
     * Additional filters to the data view. These additional filters are used alongside the
     * filters used by the insight.
     */
    additionalFilters?: IFilter[];
}

/**
 * This hook provides an easy way to read a data view from insight widget. It also allows to add
 * additional filters to this data view.
 *
 * @param config - configuration of the hook
 *
 * @public
 */
export function useInsightWidgetDataView(
    config: IUseInsightWidgetDataView,
): UseCancelablePromiseState<DataViewFacade, GoodDataSdkError> {
    const { insightWidget, additionalFilters } = config;
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const insight = useDashboardSelector(selectInsightByRef(insightWidget?.insight));
    const widgetFiltersPromise = useWidgetFilters(insightWidget, additionalFilters);

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
