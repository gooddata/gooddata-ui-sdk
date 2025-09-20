// (C) 2019-2025 GoodData Corporation
import { ColDef, GridApi } from "ag-grid-community";
import { isEqual } from "lodash-es";

import { IDimension } from "@gooddata/sdk-model";

import { IGridTotalsRow } from "./resultTypes.js";
import { COLUMN_SUBTOTAL, COLUMN_TOTAL, ROW_SUBTOTAL, ROW_TOTAL } from "../base/constants.js";

export function areTotalsChanged(gridApi: GridApi | undefined, newTotals: IGridTotalsRow[] | null): boolean {
    const totals = newTotals ?? [];
    const currentTotalsCount = gridApi?.getPinnedBottomRowCount() ?? 0;
    const newTotalsCount = newTotals?.length ?? 0;

    if (currentTotalsCount !== newTotalsCount) {
        return true;
    }

    for (let i = 0; i < currentTotalsCount; i++) {
        if (!isEqual(gridApi?.getPinnedBottomRow(i)?.data, totals[i])) {
            return true;
        }
    }

    return false;
}

function getPaginationBottomRowIndex(gridApi: GridApi): number {
    return gridApi.getDisplayedRowCount() - 1;
}

export function isInvalidGetRowsRequest(startRow: number, gridApi: GridApi | undefined): boolean {
    const bottomRowIndex = gridApi ? getPaginationBottomRowIndex(gridApi) : null;
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

export function isSomeColumnTotal(colDef: ColDef): boolean {
    return isColumnTotal(colDef) || isColumnSubtotal(colDef);
}

export function isColumnTotal(colDef: ColDef): boolean {
    const { type } = colDef;

    return type === COLUMN_TOTAL;
}

export function isColumnSubtotal(colDef: ColDef): boolean {
    const { type } = colDef;

    return type === COLUMN_SUBTOTAL;
}

export function getSubtotalStyles(dimension: IDimension | undefined): (string | null)[] {
    if (!dimension?.totals) {
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
