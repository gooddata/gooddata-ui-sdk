// (C) 2025 GoodData Corporation

import noop from "lodash/noop.js";

/**
 * Returns default column sizing props for ag-grid.
 *
 * @internal
 */
export function useColumnSizingDefault() {
    const initColumnWidths = noop;

    return {
        autoSizeStrategy: undefined,
        initColumnWidths,
    };
}
