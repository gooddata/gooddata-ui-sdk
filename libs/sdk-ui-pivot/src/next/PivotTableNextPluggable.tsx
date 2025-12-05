// (C) 2025 GoodData Corporation

import { memo } from "react";

import { isEqual } from "lodash-es";

import { PivotTableNextImplementation } from "./PivotTableNext.js";

/**
 * Memoized wrapper for the AgGridReact component
 */
export const CorePivotTableNext = memo(PivotTableNextImplementation, (prevProps, nextProps) => {
    const deepEqualPropsChanged = [
        [prevProps.execution.fingerprint(), nextProps.execution.fingerprint()],
        [prevProps.config, nextProps.config],
        [prevProps.theme, nextProps.theme],
        [prevProps.measures, nextProps.measures],
        [prevProps.rows, nextProps.rows],
        [prevProps.columns, nextProps.columns],
        [prevProps.filters, nextProps.filters],
        [prevProps.totals, nextProps.totals],
        [prevProps.drillableItems, nextProps.drillableItems],
        [prevProps.pageSize, nextProps.pageSize],
    ].some(([prev, next]) => !isEqual(prev, next));

    return !deepEqualPropsChanged;
});
