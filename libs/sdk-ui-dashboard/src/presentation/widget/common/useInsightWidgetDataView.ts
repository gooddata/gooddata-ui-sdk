// (C) 2022-2025 GoodData Corporation
import { useMemo } from "react";

import stringify from "json-stable-stringify";

import { IInsightWidget, insightSetFilters } from "@gooddata/sdk-model";
import {
    DataViewFacade,
    GoodDataSdkError,
    UseCancelablePromiseCallbacks,
    UseCancelablePromiseState,
    useBackendStrict,
    useExecutionDataView,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";

import { selectInsightByRef, useDashboardSelector, useWidgetFilters } from "../../../model/index.js";

/**
 * Configuration for the `useInsightWidgetDataView` hook.
 *
 * @public
 */
export interface IUseInsightWidgetDataView {
    /**
     * Insight widget to get data view for.
     *
     * @remarks
     * Note: When the insight widget is not provided, hook is locked in a "pending" state.
     */
    insightWidget?: IInsightWidget;
}

/**
 * Callbacks for {@link useInsightWidgetDataView} hook.
 *
 * @public
 */
export type UseInsightWidgetInsightDataViewCallbacks = UseCancelablePromiseCallbacks<
    DataViewFacade,
    GoodDataSdkError
>;

/**
 * This hook provides an easy way to read a data view from insight widget.
 *
 * @param config - configuration of the hook
 *
 * @public
 */
export function useInsightWidgetDataView({
    insightWidget,
    onCancel,
    onError,
    onLoading,
    onPending,
    onSuccess,
}: IUseInsightWidgetDataView & UseInsightWidgetInsightDataViewCallbacks): UseCancelablePromiseState<
    DataViewFacade,
    GoodDataSdkError
> {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const insight = useDashboardSelector(selectInsightByRef(insightWidget?.insight));
    const widgetFiltersPromise = useWidgetFilters(insightWidget);

    const insightWithAddedFilters = useMemo(
        () => insightSetFilters(insight!, widgetFiltersPromise.result),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            insight,
            /**
             * We use stringified value to avoid setting equal filters. This prevents cascading cache invalidation
             * and expensive re-renders down the line. The stringification is worth it as the filters are usually
             * pretty small thus saving more time than it is taking.
             */
            // eslint-disable-next-line react-hooks/exhaustive-deps
            stringify(widgetFiltersPromise.result),
        ],
    );

    const insightExecution = useMemo(() => {
        return insightWithAddedFilters && insightWidget
            ? backend.workspace(workspace).execution().forInsight(insightWithAddedFilters)
            : undefined;
    }, [backend, workspace, insightWithAddedFilters, insightWidget]);

    return useExecutionDataView({
        execution: insightExecution,
        onCancel,
        onError,
        onLoading,
        onPending,
        onSuccess,
    });
}
