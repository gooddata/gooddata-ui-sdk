// (C) 2025 GoodData Corporation

import { type IPreparedExecution } from "@gooddata/sdk-backend-spi";

/**
 * Exclude sorting updated from props to avoid unnecessary re-initializations.
 * Subsequent sorting should be always handled by ag-grid server side data source (triggered via UI or ag-grid API).
 */
export function sanitizeSortInExecution(execution: IPreparedExecution) {
    return execution.withSorting();
}
