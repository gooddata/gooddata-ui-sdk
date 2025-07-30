// (C) 2025 GoodData Corporation
import { IColumnSizing } from "../../types/sizing.js";
import { AgGridApi } from "../../types/agGrid.js";

/**
 * @internal
 */
export function agGridAutosizeColumnsToFit(gridApi: AgGridApi) {
    gridApi.sizeColumnsToFit();
}

/**
 * @internal
 */
export function agGridAutoSizeAllColumns(gridApi: AgGridApi) {
    gridApi.autoSizeAllColumns(false);
}

/**
 * @internal
 */
export function agGridUpdateColumnSizeForEmptyData(
    options: { columnSizing: IColumnSizing },
    gridApi: AgGridApi,
) {
    const { columnSizing } = options;
    const { defaultWidth } = columnSizing;
    const shouldAdaptSizeToCellContent = defaultWidth === "autoresizeAll" || defaultWidth === "viewport";
    const growToFit = columnSizing.growToFit ?? false;

    if (!shouldAdaptSizeToCellContent) {
        return;
    }

    if (growToFit) {
        agGridAutosizeColumnsToFit(gridApi);
    } else {
        agGridAutoSizeAllColumns(gridApi);
    }
}
