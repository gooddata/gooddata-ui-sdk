// (C) 2019-2022 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IDimension, IExecutionDefinition, INullableFilter, ISortItem, ObjRef } from "@gooddata/sdk-model";
import {
    useBackendStrict,
    useWorkspaceStrict,
    resolveUseCancelablePromisesStatus,
    resolveUseCancelablePromisesError,
    UseCancelablePromiseState,
    DataViewFacade,
    GoodDataSdkError,
} from "../base";
import { useExecutionDataView } from "./useExecutionDataView";
import { DataViewWindow } from "./withExecutionLoading";
import { useInsight } from "./useInsight";

/**
 * @beta
 */
export interface IUseInsightDataViewConfig {
    /**
     * Reference to the insight for which you want to get the data view.
     *
     * @remarks
     * Note: When the reference or identifier is not provided, hook is locked in a "pending" state.
     */
    insight?: ObjRef;

    /**
     * Modify sorts on prepared insight execution, before it's executed.
     */
    sorts?: ISortItem[] | ((def: IExecutionDefinition) => ISortItem[]);

    /**
     * Modify dimensions on prepared insight execution, before it's executed.
     */
    dimensions?: IDimension[] | ((def: IExecutionDefinition) => IDimension[]);

    /**
     * Modify date formatting on prepared insight execution, before it's executed.
     */
    dateFormat?: string | ((def: IExecutionDefinition) => string);

    /**
     * Specify filters to merge with filters already defined in the insight.
     */
    filters?: INullableFilter[];

    /**
     * You can define only a specific "window" of data to load.
     *
     * @remarks
     * This is useful if you want to page data.
     */
    window?: DataViewWindow;

    /**
     * Backend to work with.
     *
     * @remarks
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the executor MUST be rendered within an existing BackendContext.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace where execution should be executed.
     *
     * @remarks
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the executor MUST be rendered within an existing WorkspaceContext.
     */
    workspace?: string;
}

/**
 * React hook to get data for a specific insight.
 *
 * @beta
 */
export function useInsightDataView(
    config: IUseInsightDataViewConfig,
    deps?: React.DependencyList,
): UseCancelablePromiseState<DataViewFacade, GoodDataSdkError> {
    const { insight: insightRef, sorts, dateFormat, dimensions, filters, window } = config;
    const backend = useBackendStrict(config.backend, "useInsightDataView");
    const workspace = useWorkspaceStrict(config.workspace, "useInsightDataView");
    const effectiveDeps = deps ?? [];

    const insightPromise = useInsight({ insight: insightRef, backend, workspace }, effectiveDeps);

    let insightExecution =
        insightPromise.result &&
        backend.workspace(workspace).execution().forInsightByRef(insightPromise.result, filters);

    if (insightExecution) {
        if (sorts) {
            const resolvedSorts = typeof sorts === "function" ? sorts(insightExecution.definition) : sorts;
            insightExecution = insightExecution.withSorting(...resolvedSorts);
        }
        if (dimensions) {
            const resolvedDimensions =
                typeof dimensions === "function" ? dimensions(insightExecution.definition) : dimensions;
            insightExecution = insightExecution.withDimensions(...resolvedDimensions);
        }
        if (dateFormat) {
            const resolvedDateFormat =
                typeof dateFormat === "function" ? dateFormat(insightExecution.definition) : dateFormat;
            insightExecution = insightExecution.withDateFormat(resolvedDateFormat);
        }
    }

    const executionDataViewPromise = useExecutionDataView(
        {
            execution: insightExecution,
            window,
            backend,
            workspace,
        },
        deps,
    );

    const cancelablePromises = [insightPromise, executionDataViewPromise];

    return {
        result: executionDataViewPromise.result,
        error: resolveUseCancelablePromisesError(cancelablePromises),
        status: resolveUseCancelablePromisesStatus(cancelablePromises),
    } as UseCancelablePromiseState<DataViewFacade, GoodDataSdkError>;
}
