// (C) 2020-2022 GoodData Corporation
import { IAnalyticalBackend, IWidgetAlert } from "@gooddata/sdk-backend-spi";
import {
    GoodDataSdkError,
    useBackend,
    useCancelablePromise,
    UseCancelablePromiseCallbacks,
    UseCancelablePromiseState,
    useWorkspace,
} from "@gooddata/sdk-ui";
import { ObjRef, objRefToString } from "@gooddata/sdk-model";
import { dashboardAlertsDataLoaderFactory } from "../../dataLoaders";
import { backendInvariant, workspaceInvariant } from "./utils";

/**
 * @beta
 * @deprecated Will be removed in the 8.10.0 release. Superseded by Dashboard component; please see `@gooddata/sdk-ui-dashboard` and GoodData.UI documentation for v8.7
 */
export interface IUseDashboardAlertsConfig
    extends UseCancelablePromiseCallbacks<IWidgetAlert[], GoodDataSdkError> {
    /**
     * Reference to the dashboard to get alerts for.
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
 * Hook allowing to download dashboard alerts data for the current user
 * @param config - configuration of the hook
 * @beta
 * @deprecated Will be removed in the 8.10.0 release. Superseded by Dashboard component; please see `@gooddata/sdk-ui-dashboard` and GoodData.UI documentation for v8.7
 */
export function useDashboardAlerts({
    dashboard,
    backend,
    onCancel,
    onError,
    onLoading,
    onPending,
    onSuccess,
    workspace,
}: IUseDashboardAlertsConfig): UseCancelablePromiseState<IWidgetAlert[], GoodDataSdkError> {
    const effectiveBackend = useBackend(backend);
    const effectiveWorkspace = useWorkspace(workspace);

    backendInvariant(effectiveBackend, "useDashboardAlerts");
    workspaceInvariant(effectiveWorkspace, "useDashboardAlerts");

    const loader = dashboardAlertsDataLoaderFactory.forWorkspace(effectiveWorkspace);
    const promise = () => loader.getDashboardAlerts(effectiveBackend, dashboard);

    return useCancelablePromise({ promise, onCancel, onError, onLoading, onPending, onSuccess }, [
        effectiveBackend,
        effectiveWorkspace,
        objRefToString(dashboard),
    ]);
}
