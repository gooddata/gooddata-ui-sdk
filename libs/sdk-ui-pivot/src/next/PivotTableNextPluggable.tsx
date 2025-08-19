// (C) 2025 GoodData Corporation
import React from "react";

import cloneDeep from "lodash/cloneDeep.js";
import isEqual from "lodash/isEqual.js";

import { IPreparedExecution } from "@gooddata/sdk-backend-spi";

import { PivotTableNextImplementation } from "./PivotTableNext.js";
import { PivotTableNextConfig } from "./types/public.js";

/**
 * Memoized wrapper for the AgGridReact component, intended to be used in PluggablePivotTableNext
 *
 * @internal
 */
export const CorePivotTableNext = React.memo(PivotTableNextImplementation, (prevProps, nextProps) => {
    const executionChanged =
        sanitizeExecutionForComparison(prevProps.execution).fingerprint() !==
        sanitizeExecutionForComparison(nextProps.execution).fingerprint();

    const deepEqualPropsChanged = [
        [sanitizeConfigForUpdate(prevProps.config), sanitizeConfigForUpdate(nextProps.config)],
        [prevProps.theme, nextProps.theme],
        [prevProps.measures, nextProps.measures],
        [prevProps.rows, nextProps.rows],
        [prevProps.columns, nextProps.columns],
        [prevProps.filters, nextProps.filters],
        [prevProps.totals, nextProps.totals],
        [prevProps.drillableItems, nextProps.drillableItems],
    ].some(([prev, next]) => !isEqual(prev, next));

    return !(executionChanged || deepEqualPropsChanged);
});

/**
 * Exclude columnWidths, textWrapping from config to avoid unnecessary re-executions.
 */
function sanitizeConfigForUpdate(config: PivotTableNextConfig | undefined) {
    if (!config) {
        return config;
    }
    const clonedConfig = cloneDeep(config);
    delete clonedConfig.columnSizing?.columnWidths;
    delete clonedConfig.textWrapping;
    return clonedConfig;
}

/**
 * Exclude sorting from execution to avoid unnecessary re-executions.
 */
function sanitizeExecutionForComparison(execution: IPreparedExecution) {
    return execution.withSorting();
}
