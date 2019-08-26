// (C) 2019 GoodData Corporation
import { DashboardExport } from "@gooddata/typings";
import { ApiResponse, XhrModule } from "../xhr";
import { IExportResponse } from "../interfaces";
import { handleHeadPolling, IPollingOptions } from "../util";
import { isExportFinished, sanitizeDateFilters } from "../utils/export";

interface IDashboardExportPayload {
    dashboardExport: {
        dashboardUri: string;
        filters?: DashboardExport.FilterContextItem[];
    };
}

export class DashboardModule {
    constructor(private xhr: XhrModule) {}

    public async exportToPdf(
        projectId: string,
        dashboardUri: string,
        filters: DashboardExport.FilterContextItem[] = [],
        pollingOptions: IPollingOptions = {},
    ): Promise<IExportResponse> {
        const sanitizedFilters = sanitizeDateFilters(filters);
        const payload = this.getDashboardExportPayload(dashboardUri, sanitizedFilters);

        try {
            const response: ApiResponse = await this.xhr.post(
                `/gdc/internal/projects/${projectId}/exportDashboard`,
                { body: payload },
            );
            return await this.pollPdfFile(response, pollingOptions);
        } catch (error) {
            throw error;
        }
    }

    private async pollPdfFile(
        response: ApiResponse,
        pollingOptions: IPollingOptions,
    ): Promise<IExportResponse> {
        const data: IExportResponse = response.getData();
        const exportResponse = await handleHeadPolling(
            this.xhr.head.bind(this.xhr),
            data.uri,
            isExportFinished,
            pollingOptions,
        );
        return exportResponse;
    }

    private getDashboardExportPayload(
        dashboardUri: string,
        filters: DashboardExport.FilterContextItem[],
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
