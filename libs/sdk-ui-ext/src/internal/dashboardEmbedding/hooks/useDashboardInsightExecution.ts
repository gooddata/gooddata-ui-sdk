// (C) 2020-2021 GoodData Corporation
import {
    IAnalyticalBackend,
    IPreparedExecution,
    IInsightWidget,
    IFilterContext,
    ITempFilterContext,
    FilterContextItem,
} from "@gooddata/sdk-backend-spi";
import {
    GoodDataSdkError,
    useBackend,
    UseCancelablePromiseCallbacks,
    useWorkspace,
    OnError,
    UseCancelablePromiseState,
    useCancelablePromise,
} from "@gooddata/sdk-ui";
import { IInsight } from "@gooddata/sdk-model";
import { filterContextItemsToFiltersForWidget, filterContextToFiltersForWidget } from "../converters";
import { IDashboardFilter } from "../types";
import { backendInvariant, workspaceInvariant } from "./utils";

/**
 * @beta
 */
export interface IUseInsightExecutionConfig
    extends UseCancelablePromiseCallbacks<IPreparedExecution | undefined, GoodDataSdkError> {
    insightWidget?: IInsightWidget;
    insight?: IInsight;
    filters?: FilterContextItem[];
    filterContext?: IFilterContext | ITempFilterContext;
    backend?: IAnalyticalBackend;
    workspace?: string;
    onError?: OnError;
}

/**
 * Hook allowing to get execution for particular insight widget.
 * @param config - configuration of the hook
 * @beta
 */
export function useInsightExecution(
    config: IUseInsightExecutionConfig,
): UseCancelablePromiseState<IPreparedExecution, GoodDataSdkError> {
    const { backend, workspace, insightWidget, insight, filters, filterContext } = config;
    const effectiveBackend = useBackend(backend);
    const effectiveWorkspace = useWorkspace(workspace);

    backendInvariant(effectiveBackend, "useInsightExecution");
    workspaceInvariant(effectiveWorkspace, "useInsightExecution");

    const promise =
        insight && insightWidget
            ? async () => {
                  const inputFilters = filters
                      ? filterContextItemsToFiltersForWidget(filters, insightWidget)
                      : filterContextToFiltersForWidget(filterContext, insightWidget);

                  const relevantFilters = (await effectiveBackend
                      .workspace(effectiveWorkspace)
                      .dashboards()
                      .getResolvedFiltersForWidget(insightWidget, inputFilters)) as IDashboardFilter[]; // all the inputs are IDashboardFilter, so the result must be too

                  return effectiveBackend
                      .workspace(effectiveWorkspace)
                      .execution()
                      .forInsight(insight, relevantFilters);
              }
            : null;

    return useCancelablePromise({ promise }, [
        effectiveBackend,
        effectiveWorkspace,
        insight,
        insightWidget,
        filters,
        filterContext,
    ]);
}
