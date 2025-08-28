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

    const columnDefinition = colDef.context?.columnDefinition;
    const isRegularValueColumn = columnDefinition && columnDefinition.type === "value";

    const isTotal = !isRegularValueColumn && isGrandTotalColumnDefinition(columnDefinition);
    const isTotalGroup =
        !isRegularValueColumn &&
        (colDef as ColGroupDef).children?.some((child) =>
            isGrandTotalColumnDefinition(child.context?.columnDefinition),
        );

    const isSubtotal = !isRegularValueColumn && isSubtotalColumnDefinition(columnDefinition);
    const isSubtotalGroup =
        !isRegularValueColumn &&
        (colDef as ColGroupDef).children?.some((child) =>
            isSubtotalColumnDefinition(child.context?.columnDefinition),
        );

    const indexWithinGroup = colDef.context?.indexWithinGroup;

    return e("header-cell", {
        total: isTotal || isTotalGroup,
        subtotal: isSubtotal || isSubtotalGroup,
        "first-of-group": indexWithinGroup === 0,
    });
};
