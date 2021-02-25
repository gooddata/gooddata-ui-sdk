// (C) 2020-2021 GoodData Corporation
import { AnalyticalBackendError, IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import {
    useBackend,
    useCancelablePromise,
    UseCancelablePromiseCallbacks,
    UseCancelablePromiseState,
    useWorkspace,
} from "@gooddata/sdk-ui";
import { IDashboardFilter } from "../../types";
import { dashboardFilterToFilterContextItem } from "../../utils/filters";
import { backendInvariant, workspaceInvariant } from "../utils";

interface IUseExportDashboardToPdfConfig
    extends UseCancelablePromiseCallbacks<string, AnalyticalBackendError> {
    /**
     * Reference to the dashboard to export.
     */
    dashboard?: ObjRef;

    /**
     * Optionally, specify filters to be applied to all the widgets in the dashboard.
     * This will override any filters set on the dashboard itself.
     */
    filters?: IDashboardFilter[];

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
    const effectiveBackend = useBackend(backend);
    const effectiveWorkspace = useWorkspace(workspace);

    backendInvariant(effectiveBackend, "useExportDashboardToPdf");
    workspaceInvariant(effectiveWorkspace, "useExportDashboardToPdf");

    const promise = dashboard
        ? () =>
              effectiveBackend
                  .workspace(effectiveWorkspace)
                  .dashboards()
                  .exportDashboardToPdf(
                      dashboard,
                      filters?.map(dashboardFilterToFilterContextItem) ?? undefined,
                  )
        : null;

    return useCancelablePromise({ promise, onCancel, onError, onLoading, onPending, onSuccess }, [
        effectiveBackend,
        effectiveWorkspace,
        dashboard,
        filters,
    ]);
}
