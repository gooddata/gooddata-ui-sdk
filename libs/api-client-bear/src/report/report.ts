// (C) 2007-2023 GoodData Corporation
import {
    CompatibilityFilter,
    IAfm,
    IBaseExportConfig,
    IExportConfig,
    IExportResponse,
} from "@gooddata/api-model-bear";
import compact from "lodash/compact.js";
import isEmpty from "lodash/isEmpty.js";
import { ERROR_RESTRICTED_CODE, ERROR_RESTRICTED_MESSAGE } from "../constants/errors.js";
import { ApiResponse, ApiResponseError, XhrModule } from "../xhr.js";
import { handleHeadPolling, IPollingOptions } from "../util.js";
import { isExportFinished, getFormatContentType } from "../utils/export.js";

interface IExtendedExportConfig extends IBaseExportConfig {
    showFilters?: boolean;
    afm?: IAfm;
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
 */
export class ReportModule {
    constructor(private xhr: XhrModule) {}

    /**
     * exportResult
     * request new result export
     * request new export of existing AFM execution
     *
     * Export file is downloaded and attached as Blob data to the current window instance.
     *
     * @experimental
     * @param projectId - GoodData projectId
     * @param executionResult - report which should be exported
     * @param exportConfig - requested export options
     * @param pollingOptions - for polling (maxAttempts, pollStep)
     * @returns Resolves if export successfully,
     *                   Reject if export has error (network error, api error)
     */
    public exportResult(
        projectId: string,
        executionResult: string,
        exportConfig: IExportConfig = {},
        pollingOptions: IPollingOptions = {},
    ): Promise<IExportResponse> {
        const requestPayload: IExportResultPayload = {
            resultExport: {
                executionResult,
                exportConfig: {
                    ...exportConfig,
                    ...this.sanitizeExportConfig(exportConfig),
                },
            },
        };

        return this.xhr
            .post(`/gdc/internal/projects/${projectId}/exportResult`, { body: requestPayload })
            .then((response: ApiResponse) => response.getData())
            .then((data: IExportResponse) =>
                handleHeadPolling(this.xhr.get.bind(this.xhr), data.uri, isExportFinished, {
                    ...pollingOptions,
                    blobContentType: getFormatContentType(exportConfig.format),
                }),
            )
            .catch(this.handleExportResultError);
    }

    private sanitizeExportConfig(exportConfig: IExportConfig): IExtendedExportConfig {
        const { afm } = exportConfig;

        if (afm && !isEmpty(afm.filters)) {
            const sanitizedAfm: IAfm = {
                ...afm,
                filters: this.sanitizeFilters(afm.filters),
            };
            return {
                ...exportConfig,
                afm: sanitizedAfm,
            };
        }
        return exportConfig;
    }

    private handleExportResultError = (error: ApiResponseError | Error): Promise<Error> => {
        if (
            this.isApiResponseError(error) &&
            error.response.status === 400 &&
            error.responseBody.indexOf(ERROR_RESTRICTED_CODE) !== -1
        ) {
            const updatedError = new ApiResponseError(
                ERROR_RESTRICTED_MESSAGE,
                error.response,
                error.responseBody,
            );
            return Promise.reject(updatedError);
        }
        return Promise.reject(error);
    };

    private isApiResponseError(error: ApiResponseError | Error): error is ApiResponseError {
        return (error as ApiResponseError).response !== undefined;
    }

    private sanitizeFilters(filters?: CompatibilityFilter[]): CompatibilityFilter[] {
        return filters ? compact(filters) : [];
    }
}
