// (C) 2007-2025 GoodData Corporation
import { GridApi } from "ag-grid-community";

function getHeaderHeight(gridApi: GridApi): number {
    // DANGER: using ag-grid internals
    const headerCtrl = (gridApi.getDisplayedRowAtIndex?.(0) as any)?.beans?.ctrlsSvc?.get("gridHeaderCtrl");

    if (!headerCtrl) {
        // in some cases there is not displayed row at index 0, e.g.
        //try to get dirty internal height of the grid

        return gridApi.getSizesForCurrentTheme().headerHeight;
    }

    return headerCtrl?.eGui?.clientHeight ?? 0;
}

function getCellElement(gridApi: GridApi, attributeId: string, rowIndex: number): HTMLElement | null {
    // DANGER: using ag-grid internals
    const rowRenderer = (gridApi.getDisplayedRowAtIndex?.(rowIndex) as any)?.beans?.rowRenderer;
    if (!rowRenderer) return null;

    const centerCellCtrls = rowRenderer.getAllCellCtrls().filter((r: any) => r.rowNode.rowIndex === rowIndex);

    const cell = centerCellCtrls?.find((col: any) => {
        return col.column.colId === attributeId;
    });

    return cell?.eGui ?? null;
}

function addCellClass(gridApi: GridApi, attributeId: string, rowIndex: number, className: string): void {
    const cellElement = getCellElement(gridApi, attributeId, rowIndex);
    if (cellElement !== null) {
        cellElement.classList.add(className);
    }
}

function removeCellClass(gridApi: GridApi, attributeId: string, rowIndex: number, className: string): void {
    const cellElement = getCellElement(gridApi, attributeId, rowIndex);
    if (cellElement !== null) {
        cellElement.classList.remove(className);
    }
}

function getPinnedTopRowElement(gridApi: GridApi): HTMLElement | null {
    const pinnedTopRow = gridApi.getPinnedTopRow(0);
    if (!pinnedTopRow) {
        return null;
    }

    // DANGER: using ag-grid internals
    const rootElement = (pinnedTopRow as any).beans?.ctrlsSvc?.getGridBodyCtrl?.()?.eGridBody;
    const rowElement = rootElement?.querySelector(`[row-id=${pinnedTopRow.id}]`);
    return rowElement?.parentElement?.parentElement?.parentElement ?? null;
}

function addPinnedTopRowClass(gridApi: GridApi, className: string): void {
    const rowElement = getPinnedTopRowElement(gridApi);
    if (rowElement) {
        rowElement.classList.add(className);
    }
}

function removePinnedTopRowClass(gridApi: GridApi, className: string): void {
    const rowElement = getPinnedTopRowElement(gridApi);
    if (rowElement) {
        rowElement.classList.remove(className);
    }
}

function setPinnedTopRowStyles(gridApi: GridApi, styles: Record<string, string>): void {
    const rowElement = getPinnedTopRowElement(gridApi);
    if (rowElement) {
        for (const [key, value] of Object.entries(styles)) {
            (rowElement.style as unknown as Record<string, string>)[key] = value;
        }
    }
}

export default {
    getHeaderHeight,
    // cell element
    getCellElement,
    addCellClass,
    removeCellClass,
    // pinned row element
    getPinnedTopRowElement,
    addPinnedTopRowClass,
    removePinnedTopRowClass,
    setPinnedTopRowStyles,
    // pinned row cell element
};
