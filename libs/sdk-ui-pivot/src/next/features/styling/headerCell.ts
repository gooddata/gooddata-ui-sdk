// (C) 2025 GoodData Corporation
import { ColGroupDef, HeaderClassParams } from "ag-grid-enterprise";

import { isGrandTotalColumnDefinition, isSubtotalColumnDefinition } from "@gooddata/sdk-ui";

import { e } from "./bem.js";
import { AgGridRowData } from "../../types/internal.js";

/**
 * Returns a class name for a header cell.
 *
 * @param params - The header class params
 * @returns A class name for the header cell
 */
export const getHeaderCellClassName = (params: HeaderClassParams<AgGridRowData, string | null>) => {
    const { colDef } = params;

    const isTotal = isGrandTotalColumnDefinition(colDef.context?.columnDefinition);
    const isTotalGroup = (colDef as ColGroupDef).children?.some((child) =>
        isGrandTotalColumnDefinition(child.context?.columnDefinition),
    );

    const isSubtotal = isSubtotalColumnDefinition(colDef.context?.columnDefinition);
    const isSubtotalGroup = (colDef as ColGroupDef).children?.some((child) =>
        isSubtotalColumnDefinition(child.context?.columnDefinition),
    );

    const indexWithinGroup = colDef.context?.indexWithinGroup;

    return e("header-cell", {
        total: isTotal || isTotalGroup,
        subtotal: isSubtotal || isSubtotalGroup,
        "first-of-group": indexWithinGroup === 0,
    });
};
