// (C) 2020-2022 GoodData Corporation
import { AnalyticalBackendError, FilterContextItem, IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import {
    useBackendStrict,
    useCancelablePromise,
    UseCancelablePromiseCallbacks,
    UseCancelablePromiseState,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";

interface IUseExportDashboardToPdfConfig
    extends UseCancelablePromiseCallbacks<string, AnalyticalBackendError> {
    /**
     * Reference to the dashboard to export.
     */
    dashboard?: ObjRef;

    /**
     * Specify filters to be applied to all the widgets in the dashboard.
     * This will override any filters set on the dashboard itself.
     */
    filters?: FilterContextItem[];

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
 * Hook allowing to export a dashboard to a PDF
 * @param config - configuration of the hook
 * @internal
 */
export function useExportDashboardToPdf({
    dashboard,
    filters,
    backend,
    workspace,
    onCancel,
    onError,
    onLoading,
    onPending,
    onSuccess,
}: IUseExportDashboardToPdfConfig): UseCancelablePromiseState<string, AnalyticalBackendError> {
    const effectiveBackend = useBackendStrict(backend);
    const effectiveWorkspace = useWorkspaceStrict(workspace);

    const promise = dashboard
        ? () =>
              effectiveBackend
                  .workspace(effectiveWorkspace)
                  .dashboards()
                  .exportDashboardToPdf(dashboard, filters ?? undefined)
        : null;

    return useCancelablePromise({ promise, onCancel, onError, onLoading, onPending, onSuccess }, [
        effectiveBackend,
        effectiveWorkspace,
        dashboard,
        filters,
    ]);
}
