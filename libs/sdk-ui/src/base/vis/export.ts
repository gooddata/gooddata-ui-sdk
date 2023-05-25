// (C) 2007-2023 GoodData Corporation

import { IExecutionResult, IExportConfig, IExportBlobResult } from "@gooddata/sdk-backend-spi";
import { IExportFunction, IExtendedExportConfig } from "./Events.js";
import { GoodDataSdkError } from "../errors/GoodDataSdkError.js";

const escapeFileName = (str: string) => str?.replace(/[/?<>\\:*|"]/g, "");

function buildExportRequestConfig(exportConfig: IExtendedExportConfig, exportTitle: string | undefined) {
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

    return exportRequestConfig;
}

/**
 * Creates function to export data in the provided result. This function is typically passed by visualization
 * components via the onExportReady callback.
 *
 * @param result - data view that will be exported
 * @param exportTitle - specify title
 * @internal
 */
export function createExportFunction(result: IExecutionResult, exportTitle?: string): IExportFunction {
    return (exportConfig: IExtendedExportConfig): Promise<IExportBlobResult> => {
        const exportRequestConfig = buildExportRequestConfig(exportConfig, exportTitle);
        return result.exportToBlob(exportRequestConfig);
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
    return (_exportConfig: IExtendedExportConfig): Promise<IExportBlobResult> => {
        return Promise.reject(error);
    };
}
