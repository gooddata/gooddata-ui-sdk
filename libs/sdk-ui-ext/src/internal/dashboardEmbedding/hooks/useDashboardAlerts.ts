// (C) 2020 GoodData Corporation
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
import invariant from "ts-invariant";

/**
 * @beta
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
     * backend here, then the executor MUST be rendered within an existing BackendContext.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace where the insight exists.
     *
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the executor MUST be rendered within an existing WorkspaceContext.
     */
    workspace?: string;
}

/**
 * Hook allowing to download dashboard alerts data for the current user
 * @param config - configuration of the hook
 * @beta
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

    invariant(
        effectiveBackend,
        "The backend in useDashboardAlerts must be defined. Either pass it as a config prop or make sure there is a BackendProvider up the component tree.",
    );

    invariant(
        effectiveWorkspace,
        "The workspace in useDashboardAlerts must be defined. Either pass it as a config prop or make sure there is a WorkspaceProvider up the component tree.",
    );

    const promise = () =>
        effectiveBackend
            .workspace(effectiveWorkspace)
            .dashboards()
            .getDashboardWidgetAlertsForCurrentUser(dashboard);

    return useCancelablePromise({ promise, onCancel, onError, onLoading, onPending, onSuccess }, [
        effectiveBackend,
        effectiveWorkspace,
        objRefToString(dashboard),
    ]);
}
