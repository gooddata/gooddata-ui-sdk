// (C) 2020-2022 GoodData Corporation
import { IAnalyticalBackend, IDashboard } from "@gooddata/sdk-backend-spi";
import {
    GoodDataSdkError,
    useBackend,
    useCancelablePromise,
    UseCancelablePromiseCallbacks,
    UseCancelablePromiseState,
    useWorkspace,
} from "@gooddata/sdk-ui";
import { ObjRef, objRefToString } from "@gooddata/sdk-model";
import { dashboardDataLoaderFactory } from "../../dataLoaders";
import { backendInvariant, workspaceInvariant } from "./utils";

/**
 * @beta
 * @deprecated Will be removed in the 8.10.0 release. Superseded by Dashboard component; please see `@gooddata/sdk-ui-dashboard` and GoodData.UI documentation for v8.7
 */
export interface IUseDashboardConfig extends UseCancelablePromiseCallbacks<IDashboard, GoodDataSdkError> {
    /**
     * Reference to the dashboard to get.
     */
    dashboard: ObjRef;

    /**
     * Backend to work with.
     *
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the hook MUST be called within an existing BackendContext.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace where the insight exists.
     *
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the hook MUST be called within an existing WorkspaceContext.
     */
    workspace?: string;
}

/**
 * Hook allowing to download dashboard data
 * @param config - configuration of the hook
 * @beta
 * @deprecated Will be removed in the 8.10.0 release. Superseded by Dashboard component; please see `@gooddata/sdk-ui-dashboard` and GoodData.UI documentation for v8.7
 */
export function useDashboard({
    dashboard,
    backend,
    onCancel,
    onError,
    onLoading,
    onPending,
    onSuccess,
    workspace,
}: IUseDashboardConfig): UseCancelablePromiseState<IDashboard, any> {
    const effectiveBackend = useBackend(backend);
    const effectiveWorkspace = useWorkspace(workspace);

    backendInvariant(effectiveBackend, "useDashboard");
    workspaceInvariant(effectiveWorkspace, "useDashboard");

    const loader = dashboardDataLoaderFactory.forWorkspace(effectiveWorkspace);
    const promise = () => loader.getDashboard(effectiveBackend, dashboard);

    return useCancelablePromise({ promise, onCancel, onError, onLoading, onPending, onSuccess }, [
        effectiveBackend,
        effectiveWorkspace,
        objRefToString(dashboard),
    ]);
}
