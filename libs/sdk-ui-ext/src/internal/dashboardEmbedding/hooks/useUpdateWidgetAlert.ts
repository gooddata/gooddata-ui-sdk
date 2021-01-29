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
import invariant from "ts-invariant";

/**
 * @beta
 */
export interface IUseUpdateWidgetAlertConfig
    extends UseCancelablePromiseCallbacks<IWidgetAlert, GoodDataSdkError> {
    /**
     * Widget alert to update.
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
 * Hook allowing to update a widget alert
 * @param config - configuration of the hook
 * @beta
 */
export function useUpdateWidgetAlert({
    widgetAlert,
    backend,
    workspace,
    onCancel,
    onError,
    onLoading,
    onPending,
    onSuccess,
}: IUseUpdateWidgetAlertConfig): UseCancelablePromiseState<IWidgetAlert, any> {
    const effectiveBackend = useBackend(backend);
    const effectiveWorkspace = useWorkspace(workspace);

    invariant(
        effectiveBackend,
        "The backend in useUpdateKpiAlert must be defined. Either pass it as a config prop or make sure there is a BackendProvider up the component tree.",
    );

    invariant(
        effectiveWorkspace,
        "The workspace in useUpdateKpiAlert must be defined. Either pass it as a config prop or make sure there is a WorkspaceProvider up the component tree.",
    );

    const promise = widgetAlert
        ? () => effectiveBackend.workspace(effectiveWorkspace).dashboards().updateWidgetAlert(widgetAlert)
        : null;

    return useCancelablePromise({ promise, onCancel, onError, onLoading, onPending, onSuccess }, [
        effectiveBackend,
        effectiveWorkspace,
        widgetAlert,
    ]);
}
