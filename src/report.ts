// (C) 2007-2018 GoodData Corporation
import { XhrModule, ApiResponse } from './xhr';
import { IExportConfig, IExportResponse } from './interfaces';
import { handlePolling, IPollingOptions } from './util';

interface IResultExport {
    executionResult: string;
    exportConfig: IExportConfig;
}

interface IExportResultPayload {
    resultExport: IResultExport;
}

/**
 * Functions for working with reports
 *
 * @Class report
 * @module report
 */
export class ReportModule {
    constructor(private xhr: XhrModule) {}

    /**
     * exportResult
     * request new result export
     * request new export of existing AFM execution
     *
     * @experimental
     * @method exportResult
     * @param {String} projectId GoodData projectId
     * @param {String} executionResult report which should be exported
     * @param {IExportConfig} exportConfig requested export options
     * @param {Object} pollingOptions for polling (maxAttempts, pollStep)
     * @return {Promise} Resolves if export successfully,
     *                   Reject if export has error (network error, api error)
     */
    public exportResult(
        projectId: string,
        executionResult: string,
        exportConfig: IExportConfig = {},
        pollingOptions: IPollingOptions = {}): Promise<IExportResponse> {
        const requestPayload: IExportResultPayload = {
            resultExport: {
                executionResult,
                exportConfig
            }
        };
        return this.xhr.post(`/gdc/internal/projects/${projectId}/exportResult`, { body: requestPayload })
            .then((response: ApiResponse) => response.getData())
            .then((data: IExportResponse) =>
                handlePolling(this.xhr.head.bind(this.xhr), data.uri, this.isDataExported, pollingOptions));
    }

    private isDataExported(response: Response): boolean {
        const taskState = response.status;
        return taskState === 200 || taskState >= 400; // OK || ERROR
    }
}
