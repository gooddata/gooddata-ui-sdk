// (C) 2019-2023 GoodData Corporation
import { FilterContextItem, IExportResponse, sanitizeFiltersForExport } from "@gooddata/api-model-bear";
import { ApiResponse, XhrModule } from "../xhr.js";
import { handleHeadPolling, IPollingOptions } from "../util.js";
import { isExportFinished } from "../utils/export.js";

interface IDashboardExportPayload {
    dashboardExport: {
        dashboardUri: string;
        filters?: FilterContextItem[];
    };
}

export class DashboardModule {
    constructor(private xhr: XhrModule) {}

    public async exportToPdf(
        projectId: string,
        dashboardUri: string,
        filters: FilterContextItem[] = [],
        pollingOptions: IPollingOptions = {},
    ): Promise<IExportResponse> {
        const sanitizedFilters = sanitizeFiltersForExport(filters);
        const payload = this.getDashboardExportPayload(dashboardUri, sanitizedFilters);

        const response: ApiResponse = await this.xhr.post(
            `/gdc/internal/projects/${projectId}/exportDashboard`,
            { body: payload },
        );

        return this.pollPdfFile(response, pollingOptions);
    }

    private async pollPdfFile(
        response: ApiResponse,
        pollingOptions: IPollingOptions,
    ): Promise<IExportResponse> {
        const data: IExportResponse = response.getData();
        return handleHeadPolling(this.xhr.head.bind(this.xhr), data.uri, isExportFinished, {
            ...pollingOptions,
            blobContentType: "application/pdf",
        });
    }

    private getDashboardExportPayload(
        dashboardUri: string,
        filters: FilterContextItem[],
    ): IDashboardExportPayload {
        if (filters.length) {
            return {
                dashboardExport: {
                    dashboardUri,
                    filters,
                },
            };
        }

        // minimize payload
        return {
            dashboardExport: {
                dashboardUri,
            },
        };
    }
}
