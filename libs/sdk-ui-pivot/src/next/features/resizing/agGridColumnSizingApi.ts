// (C) 2025 GoodData Corporation
import { IColumnSizing } from "../../types/resizing.js";
import { AgGridApi } from "../../types/agGrid.js";

/**
 * Sizes columns to fit the grid width.
 *
 * @internal
 */
export function agGridAutosizeColumnsToFit(gridApi: AgGridApi) {
    gridApi.sizeColumnsToFit();
}

/**
 * Sizes columns to fit the cell and header content.
 * Works well only if there is data in the grid.
 * For empty data, use {@link agGridAutoSizeAllColumnsForEmptyData} to fit column headers content instead.
 *
 * @internal
 */
export function agGridAutoSizeAllColumns(gridApi: AgGridApi) {
    gridApi.autoSizeAllColumns(false);
}

/**
 * Sizes columns to fit the column headers content, when there is no data.
 * If only column attributes are used for the execution (with no measures and no row attributes),
 * ag-grid autoSizeStrategy "fitCellContents" is not sufficient, as it expects at least some data to calculate the column widths.
 *
 * @internal
 */
export function agGridAutoSizeAllColumnsForEmptyData(
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
