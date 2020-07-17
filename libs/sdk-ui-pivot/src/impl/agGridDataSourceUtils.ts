// (C) 2019-2020 GoodData Corporation
import { GridApi } from "@ag-grid-community/all-modules";
import ApiWrapper from "./agGridApiWrapper";
import { IGridTotalsRow } from "./agGridTypes";
import isEqual from "lodash/isEqual";

export const areTotalsChanged = (gridApi: GridApi | undefined, newTotals: IGridTotalsRow[]) => {
    const currentTotalsCount = gridApi?.getPinnedBottomRowCount() ?? 0;
    const newTotalsCount = newTotals === null ? 0 : newTotals.length;

    if (currentTotalsCount !== newTotalsCount) {
        return true;
    }

    for (let i = 0; i < currentTotalsCount; i++) {
        if (!isEqual(gridApi.getPinnedBottomRow(i).data, newTotals[i])) {
            return true;
        }
    }

    return false;
};

export const isInvalidGetRowsRequest = (startRow: number, gridApi: GridApi | undefined): boolean => {
    const bottomRowIndex = gridApi ? ApiWrapper.getPaginationBottomRowIndex(gridApi) : null;
    if (bottomRowIndex !== null) {
        return startRow > bottomRowIndex;
    }

    return false;
};
