// (C) 2019 GoodData Corporation
import { GridApi } from 'ag-grid-community';
import ApiWrapper from './agGridApiWrapper';
import { IGridTotalsRow } from './agGridTypes';
import isEqual = require('lodash/isEqual');

export const areTotalsChanged = (gridApi: GridApi, newTotals: IGridTotalsRow[]) => {
    const currentTotalsCount = gridApi.getPinnedBottomRowCount();
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

export const isInvalidGetRowsRequest = (startRow: number, gridApi: GridApi): boolean => {
    const bottomRowIndex = ApiWrapper.getPaginationBottomRowIndex(gridApi);
    if (bottomRowIndex !== null) {
        return startRow > bottomRowIndex;
    }

    return false;
};
