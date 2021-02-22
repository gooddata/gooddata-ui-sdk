// (C) 2020-2021 GoodData Corporation
import {
    IAnalyticalBackend,
    IPreparedExecution,
    IKpiWidget,
    IFilterContext,
    ITempFilterContext,
    UnexpectedError,
    FilterContextItem,
} from "@gooddata/sdk-backend-spi";
import {
    GoodDataSdkError,
    useBackend,
    UseCancelablePromiseCallbacks,
    useWorkspace,
    OnError,
    useExecution,
    UseCancelablePromiseState,
} from "@gooddata/sdk-ui";
import compact from "lodash/compact";
import { useKpiData } from "./useKpiData";
import { backendInvariant, workspaceInvariant } from "./utils";

/**
 * @beta
 */
export interface IUseKpiExecutionConfig
    extends UseCancelablePromiseCallbacks<IPreparedExecution | undefined, GoodDataSdkError> {
    kpiWidget?: IKpiWidget;
    filters?: FilterContextItem[];
    filterContext?: IFilterContext | ITempFilterContext;
    backend?: IAnalyticalBackend;
    workspace?: string;
    onError?: OnError;
}

/**
 * Hook allowing to get execution for particular kpi widget.
 * @param config - configuration of the hook
 * @beta
 */
export function useKpiExecution(
    config: IUseKpiExecutionConfig,
): UseCancelablePromiseState<IPreparedExecution, GoodDataSdkError> {
    const { backend, workspace } = config;
    const effectiveBackend = useBackend(backend);
    const effectiveWorkspace = useWorkspace(workspace);

    backendInvariant(effectiveBackend, "useKpiExecution");
    workspaceInvariant(effectiveWorkspace, "useKpiExecution");

    const { result, status, error } = useKpiData(config);
    const execution = useExecution({
        seriesBy: compact([result?.primaryMeasure, result?.secondaryMeasure]),
        filters: result?.effectiveFilters,
        backend: effectiveBackend,
        workspace: effectiveWorkspace,
    });

    switch (status) {
        case "pending":
        case "loading": {
            return { status, result: undefined, error: undefined };
        }
        case "error":
            return { status, result: undefined, error };
        case "success": {
            return { status, result: execution, error: undefined };
        }
        default: {
            const unhandledStatus: never = status;
            throw new UnexpectedError(`Unhandled status: ${unhandledStatus}`);
        }
    }
}
