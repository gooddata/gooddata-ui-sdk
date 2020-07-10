// (C) 2020 GoodData Corporation
import { Column, ColumnApi } from "@ag-grid-community/all-modules";

export const getFakeColumnApi = (columnsMaps: { [id: string]: Column }): ColumnApi => {
    const fakeColumnApi = {
        getColumn: (columnId: string) => {
            return columnsMaps[columnId];
        },
        setColumnWidth: (column: Column, width: number) => {
            columnsMaps[column.getColId()].getColDef().width = width;
        },
        getAllColumns: () => {
            return Object.keys(columnsMaps).map((colId: string) => columnsMaps[colId]);
        },
    };
    return fakeColumnApi as ColumnApi;
};

export const getFakeColumn = (colDef: any): Column => {
    const columnDefinition = {
        ...colDef,
    };
    const fakeColumn = {
        getColDef: () => {
            return columnDefinition;
        },
        getColId: () => {
            return columnDefinition.colId;
        },

        getActualWidth: () => {
            return columnDefinition.width;
        },
        drillItems: columnDefinition.drillItems,
    };

    return (fakeColumn as unknown) as Column;
};
