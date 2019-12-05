// (C) 2007-2019 GoodData Corporation
import { AFM, ExecuteAFM } from "@gooddata/typings";
import compact from "lodash/compact";
import isEmpty from "lodash/isEmpty";
import { ERROR_RESTRICTED_CODE, ERROR_RESTRICTED_MESSAGE } from "../constants/errors";
import {
    convertAbsoluteDateFilter,
    convertRelativeDateFilter,
} from "../DataLayer/converters/FilterConverter";
import { convertFilter as convertAttributeFilter } from "../execution/execute-afm.convert";
import { IBaseExportConfig, IExportConfig, IExportResponse } from "../interfaces";
import { ApiResponseError, XhrModule, ApiResponse } from "../xhr";
import { handleHeadPolling, IPollingOptions } from "../util";
import { isExportFinished } from "../utils/export";

interface IExtendedExportConfig extends IBaseExportConfig {
    showFilters?: boolean;
    afm?: ExecuteAFM.IAfm;
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
                handleHeadPolling(this.xhr.get.bind(this.xhr), data.uri, isExportFinished, pollingOptions),
            )
            .catch(this.handleExportResultError);
    }

    private sanitizeExportConfig(exportConfig: IExportConfig): IExtendedExportConfig {
        const { afm } = exportConfig;

        if (afm && !isEmpty(afm.filters)) {
            const sanitizedAfm: ExecuteAFM.IAfm = {
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
            return Promise.reject({
                ...error,
                message: ERROR_RESTRICTED_MESSAGE,
            });
        }
        return Promise.reject(error);
    };

    private isApiResponseError(error: ApiResponseError | Error): error is ApiResponseError {
        return (error as ApiResponseError).response !== undefined;
    }

    private sanitizeFilters(filters?: AFM.CompatibilityFilter[]): ExecuteAFM.CompatibilityFilter[] {
        return filters ? compact(filters.map(this.sanitizeFilter)) : [];
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
