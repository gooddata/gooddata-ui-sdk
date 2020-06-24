// (C) 2007-2020 GoodData Corporation
import { ColumnApi } from "@ag-grid-community/all-modules";

export const setColumnMaxWidth = (
    columnApi: ColumnApi,
    columnIds: string[],
    newMaxWidth: number | undefined,
) => {
    columnIds.forEach((colId) => {
        const column = columnApi.getColumn(colId);

        if (column) {
            // we need set maxWidth dynamically before autoresize
            // set this by column.getColDef().maxWidth not working
            (column as any).maxWidth = newMaxWidth;
        }
    });
};
