// (C) 2025 GoodData Corporation
import { type IExecutionResult } from "@gooddata/sdk-backend-spi";
import { type OnExportReady, createExportFunction } from "@gooddata/sdk-ui";

/**
 * Handles export ready functionality by creating export function
 */
export const handleExportReady = (
    result: IExecutionResult,
    onExportReady: OnExportReady,
    exportTitle?: string,
): void => {
    const exportFunction = createExportFunction(result, exportTitle);
    onExportReady(exportFunction);
};
