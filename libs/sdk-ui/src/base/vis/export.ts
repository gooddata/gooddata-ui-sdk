// (C) 2007-2025 GoodData Corporation

import { type IExecutionResult, type IExportConfig, type IExportResult } from "@gooddata/sdk-backend-spi";

import { type IExportFunction, type IExtendedExportConfig } from "./Events.js";
import { type GoodDataSdkError } from "../errors/GoodDataSdkError.js";

const escapeFileName = (str: string) => str?.replace(/[/?<>\\:*|"]/g, "");

function buildExportRequestConfig(exportConfig: IExtendedExportConfig, exportTitle: string | undefined) {
    const {
        format,
        includeFilterContext,
        showFilters,
        mergeHeaders,
        title: customTitle,
        pdfConfiguration,
        timeout,
    } = exportConfig;

    const title: string = escapeFileName(customTitle || exportTitle || "Untitled");

    const exportRequestConfig: IExportConfig = {
        format,
        mergeHeaders,
        title,
        timeout,
    };

    if (includeFilterContext || showFilters) {
        exportRequestConfig.showFilters = true;
    }

    if (pdfConfiguration) {
        exportRequestConfig.pdfConfiguration = pdfConfiguration;
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
    return (exportConfig: IExtendedExportConfig): Promise<IExportResult> => {
        const exportRequestConfig = buildExportRequestConfig(exportConfig, exportTitle);
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
