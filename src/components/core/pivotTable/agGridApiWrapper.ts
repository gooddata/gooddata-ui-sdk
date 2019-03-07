// (C) 2007-2019 GoodData Corporation
import { GridApi } from 'ag-grid';

function getHeaderHeight(gridApi: GridApi): number {
    return (gridApi as any).headerRootComp.eHeaderContainer.clientHeight;
}

function getRowHeight(gridApi: GridApi): number {
    return (gridApi as any).getModel().rowHeight;
}

export default {
    getHeaderHeight,
    getRowHeight
};
