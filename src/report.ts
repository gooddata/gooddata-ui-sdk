// (C) 2007-2019 GoodData Corporation
import { AFM, ExecuteAFM } from "@gooddata/typings";
import compact from "lodash/compact";
import isArray from "lodash/isArray";
import { ERROR_RESTRICTED_CODE, ERROR_RESTRICTED_MESSAGE } from "./constants/errors";
import { convertAbsoluteDateFilter, convertRelativeDateFilter } from "./DataLayer/converters/FilterConverter";
import { convertFilter as convertAttributeFilter } from "./execution/execute-afm.convert";
import { IBaseExportConfig, IExportConfig, IExportResponse } from "./interfaces";
import { handleHeadPolling, IPollingOptions } from "./util";
import { ApiResponseError, XhrModule, ApiResponse } from "./xhr";

interface IExtendedExportConfig extends IBaseExportConfig {
    showFilters?: ExecuteAFM.CompatibilityFilter[];
}

interface IResultExport {
    executionResult: string;
    exportConfig: IExtendedExportConfig;
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
        pollingOptions: IPollingOptions = {},
    ): Promise<IExportResponse> {
        const { showFilters } = exportConfig;

        const sanitizedFilters = this.sanitizeFilters(showFilters);
        const requestPayload: IExportResultPayload = {
            resultExport: {
                executionResult,
                exportConfig: {
                    ...exportConfig,
                    showFilters: sanitizedFilters,
                },
            },
        };

        return this.xhr
            .post(`/gdc/internal/projects/${projectId}/exportResult`, { body: requestPayload })
            .then((response: ApiResponse) => response.getData())
            .then((data: IExportResponse) =>
                handleHeadPolling(this.xhr.get.bind(this.xhr), data.uri, this.isDataExported, pollingOptions),
            )
            .catch(this.handleExportResultError);
    }

    private handleExportResultError = (error: ApiResponseError | Error): Promise<Error> => {
        if (
            this.isApiResponseError(error) &&
            error.response.status === 400 &&
            error.responseBody.indexOf(ERROR_RESTRICTED_CODE) !== -1
        ) {
            return Promise.reject({
                ...error,
                message: ERROR_RESTRICTED_MESSAGE,
            });
        }
        return Promise.reject(error);
    };

    private isDataExported(responseHeaders: Response): boolean {
        const taskState = responseHeaders.status;
        return taskState === 200 || taskState >= 400; // OK || ERROR
    }

    private isApiResponseError(error: ApiResponseError | Error): error is ApiResponseError {
        return (error as ApiResponseError).response !== undefined;
    }

    private sanitizeFilters(
        showFilters?: AFM.CompatibilityFilter[],
    ): ExecuteAFM.CompatibilityFilter[] | undefined {
        if (isArray(showFilters) && showFilters.length > 0) {
            return compact(showFilters.map(this.sanitizeFilter));
        }
        return undefined;
    }

    private sanitizeFilter(filter: AFM.CompatibilityFilter): ExecuteAFM.CompatibilityFilter | null {
        if (AFM.isAttributeFilter(filter)) {
            return convertAttributeFilter(filter);
        } else if (AFM.isAbsoluteDateFilter(filter)) {
            return convertAbsoluteDateFilter(filter);
        } else if (AFM.isRelativeDateFilter(filter)) {
            return convertRelativeDateFilter(filter);
        }
        return filter;
    }
}
