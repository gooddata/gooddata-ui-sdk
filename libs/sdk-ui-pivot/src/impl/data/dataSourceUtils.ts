// (C) 2019-2021 GoodData Corporation
import { GridApi } from "@ag-grid-community/all-modules";
import ApiWrapper from "../base/agGridApiWrapper";
import isEqual from "lodash/isEqual";
import { IGridTotalsRow } from "./resultTypes";
import { ROW_SUBTOTAL, ROW_TOTAL } from "../base/constants";
import { IDimension } from "@gooddata/sdk-model";

export function areTotalsChanged(gridApi: GridApi | undefined, newTotals: IGridTotalsRow[]): boolean {
    const currentTotalsCount = gridApi?.getPinnedBottomRowCount() ?? 0;
    const newTotalsCount = newTotals?.length ?? 0;

    if (currentTotalsCount !== newTotalsCount) {
        return true;
    }

    for (let i = 0; i < currentTotalsCount; i++) {
        if (!isEqual(gridApi?.getPinnedBottomRow(i).data, newTotals[i])) {
            return true;
        }
    }

    return false;
}

export function isInvalidGetRowsRequest(startRow: number, gridApi: GridApi | undefined): boolean {
    const bottomRowIndex = gridApi ? ApiWrapper.getPaginationBottomRowIndex(gridApi) : null;
    if (bottomRowIndex !== null) {
        return startRow > bottomRowIndex;
    }

    return false;
}

export function isSomeTotal(rowType: string | undefined): boolean {
    const isRowTotal = rowType === ROW_TOTAL;
    const isRowSubtotal = rowType === ROW_SUBTOTAL;
    return isRowTotal || isRowSubtotal;
}

export function getSubtotalStyles(dimension: IDimension | undefined): (string | null)[] {
    if (!dimension || !dimension.totals) {
        return [];
    }

    let even = false;
    const subtotalStyles = dimension.itemIdentifiers.slice(1).map((attributeIdentifier) => {
        const hasSubtotal =
            dimension.totals?.some((total) => total.attributeIdentifier === attributeIdentifier) ?? false;

        if (hasSubtotal) {
            even = !even;
            return even ? "even" : "odd";
        }

        return null;
    });

    // Grand total (first) has no styles
    return [null, ...subtotalStyles];
}
