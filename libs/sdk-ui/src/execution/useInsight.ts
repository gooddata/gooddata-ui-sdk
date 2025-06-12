// (C) 2019-2021 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IInsight, ObjRef, objRefToString } from "@gooddata/sdk-model";
import {
    useBackendStrict,
    useWorkspaceStrict,
    useCancelablePromise,
    UseCancelablePromiseState,
    GoodDataSdkError,
} from "../base/index.js";

/**
 * @internal
 */
export interface IUseInsightConfig {
    /**
     * Insight reference - when the reference is not provided, hook is locked in a "pending" state.
     */
    insight?: ObjRef;

    /**
     * Backend to work with.
     *
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the executor MUST be rendered within an existing BackendContext.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace where execution should be executed.
     *
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the executor MUST be rendered within an existing WorkspaceContext.
     */
    workspace?: string;
}

/**
 * @internal
 */
export function useInsight(
    config: IUseInsightConfig,
    deps?: React.DependencyList,
): UseCancelablePromiseState<IInsight, GoodDataSdkError> {
    const { insight } = config;
    const backend = useBackendStrict(config.backend, "useInsight");
    const workspace = useWorkspaceStrict(config.workspace, "useInsight");
    const promise = insight ? () => backend.workspace(workspace).insights().getInsight(insight) : null;

    return useCancelablePromise({ promise }, [
        backend,
        workspace,
        insight ? objRefToString(insight) : "__insightRef__",
        ...(deps ?? []),
    ]);
}
