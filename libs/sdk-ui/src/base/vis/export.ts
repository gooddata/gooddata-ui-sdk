// (C) 2007-2022 GoodData Corporation

import { IExecutionResult, IExportConfig, IExportResult } from "@gooddata/sdk-backend-spi";
import { IExportFunction, IExtendedExportConfig } from "./Events";
import { GoodDataSdkError } from "../errors/GoodDataSdkError";

const escapeFileName = (str: string) => str?.replace(/[/?<>\\:*|":]/g, "");

/**
 * Creates function to export data in the provided result. This function is typically passed by visualization
 * components via the onExportReady callback.
 *
 * @param result - data view that will be exported
 * @param exportTitle - specify title
 * @internal
 */
export function createExportFunction(result: IExecutionResult, exportTitle?: string): IExportFunction {
    return (exportConfig: IExtendedExportConfig): Promise<IExportResult> => {
        const { format, includeFilterContext, mergeHeaders, title: customTitle } = exportConfig;

        const title: string = escapeFileName(customTitle || exportTitle || "Untitled");

        const exportRequestConfig: IExportConfig = {
            format,
            mergeHeaders,
            title,
        };

        if (includeFilterContext) {
            exportRequestConfig.showFilters = true;
        }

        return result.export(exportRequestConfig);
    };
}

/**
 * Creates function that should be passed to onExportReady in the event that the backend execution
 * fails and export is not possible.
 *
 * @param error - the execution error
 * @internal
 */
export function createExportErrorFunction(error: GoodDataSdkError): IExportFunction {
    return (_exportConfig: IExtendedExportConfig): Promise<IExportResult> => {
        return Promise.reject(error);
    };
}
