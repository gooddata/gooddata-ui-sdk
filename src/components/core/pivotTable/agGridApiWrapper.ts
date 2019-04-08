// (C) 2007-2019 GoodData Corporation
import { GridApi } from 'ag-grid';

function getHeaderHeight(gridApi: GridApi): number {
    return (gridApi as any).headerRootComp.eHeaderContainer.clientHeight;
}

function getCellElement(gridApi: GridApi, attributeId: string, rowIndex: number): HTMLElement | null {
    const rowComp = (gridApi as any).rowRenderer.rowCompsByIndex[rowIndex];
    return rowComp && rowComp.cellComps[attributeId]
        ? rowComp.cellComps[attributeId].eGui
        : null;
}

function addCellClass(gridApi: GridApi, attributeId: string, rowIndex: number, className: string) {
    const cellElement = getCellElement(gridApi, attributeId, rowIndex);
    if (cellElement !== null) {
        cellElement.classList.add(className);
    }
}

function removeCellClass(gridApi: GridApi, attributeId: string, rowIndex: number, className: string) {
    const cellElement = getCellElement(gridApi, attributeId, rowIndex);
    if (cellElement !== null) {
        cellElement.classList.remove(className);
    }
}

function getPinnedTopRow(gridApi: GridApi): any | null {
    const pinnedTopRow = (gridApi as any).rowRenderer.floatingTopRowComps[0];
    return pinnedTopRow ? pinnedTopRow : null;
}

function getPinnedTopRowElement(gridApi: GridApi): HTMLElement | null {
    const pinnedTopRow = getPinnedTopRow(gridApi);
    return pinnedTopRow
        ? pinnedTopRow.bodyContainerComp.eContainer.parentElement.parentElement
        : null;
}

function addPinnedTopRowClass(gridApi: GridApi, className: string) {
    const rowElement = getPinnedTopRowElement(gridApi);
    rowElement.classList.add(className);
}

function removePinnedTopRowClass(gridApi: GridApi, className: string) {
    const rowElement = getPinnedTopRowElement(gridApi);
    rowElement.classList.remove(className);
}

function setPinnedTopRowStyle(gridApi: GridApi, propertyName: string, propertyValue: string) {
    const rowElement = getPinnedTopRowElement(gridApi);
    rowElement.style[propertyName] = propertyValue;
}

function getPinnedTopRowCellElement(gridApi: GridApi, attributeId: string): HTMLElement | null {
    const pinnedTopRow = getPinnedTopRow(gridApi);
    return pinnedTopRow && pinnedTopRow.cellComps[attributeId]
        ? pinnedTopRow.cellComps[attributeId].eGui
        : null;
}

function addPinnedTopRowCellClass(gridApi: GridApi, attributeId: string, className: string) {
    const cellElement = getPinnedTopRowCellElement(gridApi, attributeId);
    if (cellElement !== null) {
        cellElement.classList.add(className);
    }
}

function removePinnedTopRowCellClass(gridApi: GridApi, attributeId: string, className: string) {
    const cellElement = getPinnedTopRowCellElement(gridApi, attributeId);
    if (cellElement !== null) {
        cellElement.classList.remove(className);
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
    getPinnedTopRowCellElement,
    addPinnedTopRowCellClass,
    removePinnedTopRowCellClass
};
