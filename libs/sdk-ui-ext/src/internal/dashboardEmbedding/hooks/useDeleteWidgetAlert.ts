// (C) 2020-2021 GoodData Corporation
import { IAnalyticalBackend, IWidgetAlert } from "@gooddata/sdk-backend-spi";
import {
    GoodDataSdkError,
    useBackend,
    useCancelablePromise,
    UseCancelablePromiseCallbacks,
    UseCancelablePromiseState,
    useWorkspace,
} from "@gooddata/sdk-ui";
import { backendInvariant, workspaceInvariant } from "./utils";

/**
 * @beta
 */
export interface IUseDeleteWidgetAlertConfig extends UseCancelablePromiseCallbacks<void, GoodDataSdkError> {
    /**
     * Widget alert to delete.
     */
    widgetAlert?: IWidgetAlert;

    /**
     * Backend to work with.
     *
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the hook MUST be called within an existing BackendContext.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace to work with.
     *
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the hook MUST be called within an existing WorkspaceContext.
     */
    workspace?: string;
}

/**
 * Hook allowing to delete a widget alert
 * @param config - configuration of the hook
 * @beta
 */
export function useDeleteWidgetAlert({
    widgetAlert,
    backend,
    workspace,
    onCancel,
    onError,
    onLoading,
    onPending,
    onSuccess,
}: IUseDeleteWidgetAlertConfig): UseCancelablePromiseState<void, any> {
    const effectiveBackend = useBackend(backend);
    const effectiveWorkspace = useWorkspace(workspace);

    backendInvariant(effectiveBackend, "useDeleteWidgetAlert");
    workspaceInvariant(effectiveWorkspace, "useDeleteWidgetAlert");

    const promise = widgetAlert
        ? () => effectiveBackend.workspace(effectiveWorkspace).dashboards().deleteWidgetAlert(widgetAlert.ref)
        : null;

    return useCancelablePromise({ promise, onCancel, onError, onLoading, onPending, onSuccess }, [
        effectiveBackend,
        effectiveWorkspace,
        widgetAlert,
    ]);
}
