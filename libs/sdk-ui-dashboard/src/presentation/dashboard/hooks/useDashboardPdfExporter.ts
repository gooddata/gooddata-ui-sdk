// (C) 2021-2022 GoodData Corporation
import { useState } from "react";
import { AnalyticalBackendError, IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { UseCancelablePromiseCallbacks, UseCancelablePromiseStatus } from "@gooddata/sdk-ui";
import { ObjRef, FilterContextItem } from "@gooddata/sdk-model";
import { useExportDashboardToPdf as useExportDashboardToPdfCore } from "./useExportDashboardToPdf";
import { downloadFile } from "../../../_staging/fileUtils/downloadFile";

/**
 * @beta
 */
export interface IUseDashboardPdfExporterConfig
    extends UseCancelablePromiseCallbacks<string, AnalyticalBackendError> {
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
 * @beta
 */
export interface IUseDashboardPdfExporterResult {
    /**
     * When called, triggers the export process and ends with downloading the file when ready.
     *
     * @param dashboard - reference to the dashboard to export
     * @param filters - optional filters to be applied to all the widgets in the dashboard (if used this will override any filters set on the dashboard itself)
     */
    exportDashboard: (dashboard: ObjRef, filters?: FilterContextItem[]) => void;

    /**
     * Current status of the export operation.
     */
    status: UseCancelablePromiseStatus;

    /**
     * Error that occurred during the export (if any).
     */
    error: AnalyticalBackendError | undefined;
}

/**
 * Hook providing convenience function for exporting a dashboard to PDF.
 *
 * @param config - configuration of the hook
 * @beta
 */
export function useDashboardPdfExporter({
    backend,
    workspace,
    onError,
    onCancel,
    onLoading,
    onPending,
    onSuccess,
}: IUseDashboardPdfExporterConfig = {}): IUseDashboardPdfExporterResult {
    const [dashboardToExport, setDashboardToExport] = useState<ObjRef | undefined>();
    const [filtersToExport, setFiltersToExport] = useState<FilterContextItem[] | undefined>();
    const exportDashboard = (dashboard: ObjRef, filters?: FilterContextItem[]) => {
        setDashboardToExport(dashboard);
        setFiltersToExport(filters);
    };
    const { status, error } = useExportDashboardToPdfCore({
        backend,
        workspace,
        dashboard: dashboardToExport,
        filters: filtersToExport,
        onError: (error) => {
            // reset the dashboard to allow follow-up exports of the same dashboard
            setDashboardToExport(undefined);
            onError?.(error);
        },
        onSuccess: (url) => {
            downloadFile(url);
            onSuccess?.(url);
            // reset the dashboard to allow follow-up exports of the same dashboard
            setDashboardToExport(undefined);
        },
        onCancel: () => {
            // reset the dashboard to allow follow-up exports of the same dashboard
            setDashboardToExport(undefined);
            onCancel?.();
        },
        onLoading,
        onPending,
    });

    return {
        exportDashboard,
        status,
        error,
    };
}
