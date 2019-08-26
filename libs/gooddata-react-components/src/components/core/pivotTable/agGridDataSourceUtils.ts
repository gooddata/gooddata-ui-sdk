// (C) 2019 GoodData Corporation
import { AFM, Execution } from "@gooddata/typings";
import isEqual = require("lodash/isEqual");
import { GridApi } from "ag-grid-community";
import { IGridTotalsRow } from "./agGridTypes";
import { IGetPage } from "../base/VisualizationLoadingHOC";
import ApiWrapper from "./agGridApiWrapper";

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

interface ICachedPageRequest {
    requestParams: {
        resultSpec: AFM.IResultSpec;
        limit: number[];
        offset: number[];
    };
    response: Execution.IExecutionResponses | null;
}

/**
 * Ensures getPage request is cached due current life-cycle of PivotTable,
 * when sorting has to be computed after first getPage request which means the same code is called twice
 *
 * See ticket: BB-1526
 *
 * @param getPage
 */
export const wrapGetPageWithCaching = (getPage: IGetPage): IGetPage => {
    let firstCachedPageRequest: ICachedPageRequest = null;

    return async (resultSpec, limit, offset) => {
        const requestParams: ICachedPageRequest["requestParams"] = {
            resultSpec,
            limit,
            offset,
        };

        if (firstCachedPageRequest && isEqual(firstCachedPageRequest.requestParams, requestParams)) {
            return firstCachedPageRequest.response;
        }

        const execution = await getPage(resultSpec, limit, offset);
        if (firstCachedPageRequest === null) {
            firstCachedPageRequest = {
                requestParams,
                response: execution,
            };
        }

        return execution;
    };
};
