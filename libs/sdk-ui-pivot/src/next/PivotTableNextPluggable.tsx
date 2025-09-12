// (C) 2025 GoodData Corporation

import React from "react";

import isEqual from "lodash/isEqual.js";

import { PivotTableNextImplementation } from "./PivotTableNext.js";

/**
 * Memoized wrapper for the AgGridReact component, intended to be used in PluggablePivotTableNext
 *
 * @internal
 */
export const CorePivotTableNext = React.memo(PivotTableNextImplementation, (prevProps, nextProps) => {
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
    ].some(([prev, next]) => !isEqual(prev, next));

    return !deepEqualPropsChanged;
});
