// (C) 2007-2021 GoodData Corporation
import { GridApi } from "@ag-grid-community/all-modules";

function getHeaderHeight(gridApi: GridApi): number {
    return (gridApi as any)?.headerRootComp?.eHeaderContainer?.clientHeight ?? 0;
}

function getCellElement(gridApi: GridApi, attributeId: string, rowIndex: number): HTMLElement | null {
    const rowRenderer = (gridApi as any).rowRenderer;
    const rowCon = rowRenderer.rowConsByRowIndex[rowIndex];

    return rowCon ? rowCon.centerRowComp.cellComps[attributeId].eGui : null;
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

function getPaginationBottomRowIndex(gridApi: GridApi): number | null {
    const paginationProxy = (gridApi as any).paginationProxy;
    if (paginationProxy) {
        return paginationProxy.bottomRowBounds?.rowIndex ?? null;
    }

    return null;
}

function getPinnedTopRowElement(gridApi: GridApi): HTMLElement | null {
    const pinnedTopRow = gridApi.getPinnedTopRow(0);
    if (!pinnedTopRow) {
        return null;
    }

    const rootElement: HTMLElement = (gridApi as any).gridBodyComp.eGui;
    const rowElement = rootElement.querySelector(`[row-id=${pinnedTopRow.id}]`);

    return rowElement?.parentElement?.parentElement ?? null;
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

function setPinnedTopRowStyle(gridApi: GridApi, propertyName: string, propertyValue: string): void {
    const rowElement = getPinnedTopRowElement(gridApi);
    if (rowElement) {
        rowElement.style[propertyName] = propertyValue;
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
    setPinnedTopRowStyle,
    // pinned row cell element
    getPaginationBottomRowIndex,
};
