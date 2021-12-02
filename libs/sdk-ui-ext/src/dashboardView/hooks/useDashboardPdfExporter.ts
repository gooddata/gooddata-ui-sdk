// (C) 2021 GoodData Corporation
import { useState } from "react";
import { AnalyticalBackendError, IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { UseCancelablePromiseCallbacks, UseCancelablePromiseStatus } from "@gooddata/sdk-ui";
import { ObjRef } from "@gooddata/sdk-model";
import { IDashboardFilter } from "../types";
import { useExportDashboardToPdf as useExportDashboardToPdfCore } from "./internal/useExportDashboardToPdf";

function downloadFile(uri: string): void {
    const anchor = document.createElement("a");
    anchor.id = "downloader";
    anchor.href = uri;
    anchor.download = uri;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}

/**
 * @beta
 * @deprecated superseded by Dashboard component; please see `@gooddata/sdk-ui-dashboard` and GoodData.UI documentation for v8.7
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
 * @deprecated superseded by Dashboard component; please see `@gooddata/sdk-ui-dashboard` and GoodData.UI documentation for v8.7
 */
export interface IUseDashboardPdfExporterResult {
    /**
     * When called, triggers the export process and ends with downloading the file when ready.
     *
     * @param dashboard - reference to the dashboard to export
     * @param filters - optional filters to be applied to all the widgets in the dashboard (if used this will override any filters set on the dashboard itself)
     */
    exportDashboard: (dashboard: ObjRef, filters?: IDashboardFilter[]) => void;

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
 * @deprecated superseded by Dashboard component; please see `@gooddata/sdk-ui-dashboard` and GoodData.UI documentation for v8.7
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
    const [filtersToExport, setFiltersToExport] = useState<IDashboardFilter[] | undefined>();
    const exportDashboard = (dashboard: ObjRef, filters?: IDashboardFilter[]) => {
        setDashboardToExport(dashboard);
        setFiltersToExport(filters);
    };
    const { status, error } = useExportDashboardToPdfCore({
        backend,
        workspace,
        dashboard: dashboardToExport,
        filters: filtersToExport,
        onError: (error) => {
            setDashboardToExport(undefined);
            onError?.(error);
        },
        onSuccess: (url) => {
            downloadFile(url);
            onSuccess?.(url);
        },
        onCancel,
        onLoading,
        onPending,
    });

    return {
        exportDashboard,
        status,
        error,
    };
}
