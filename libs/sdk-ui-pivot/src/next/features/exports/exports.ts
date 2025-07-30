// (C) 2025 GoodData Corporation
import { IExecutionResult } from "@gooddata/sdk-backend-spi";
import { OnExportReady, createExportFunction } from "@gooddata/sdk-ui";

/**
 * Handles export ready functionality by creating export function
 */
export const handleExportReady = (result: IExecutionResult, onExportReady: OnExportReady): void => {
    const exportFunction = createExportFunction(result, undefined);
    onExportReady(exportFunction);
};
