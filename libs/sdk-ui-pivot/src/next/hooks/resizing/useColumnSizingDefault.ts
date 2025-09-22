// (C) 2025 GoodData Corporation

/**
 * Returns default column sizing props for ag-grid.
 *
 * @internal
 */
export function useColumnSizingDefault() {
    const initColumnWidths = () => {};

    return {
        autoSizeStrategy: undefined,
        initColumnWidths,
    };
}
