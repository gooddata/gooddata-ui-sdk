// (C) 2025 GoodData Corporation

import { ColGroupDef, HeaderClassParams } from "ag-grid-enterprise";

import {
    ITableDataHeaderScope,
    isGrandTotalColumnDefinition,
    isSubtotalColumnDefinition,
    isValueColumnDefinition,
} from "@gooddata/sdk-ui";

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
    const isPartOfColumnGroup = !!params.columnGroup;
    const columnScope: ITableDataHeaderScope[] = colDef.context?.columnDefinition.columnScope ?? [];
    const isAttributeOnlyColumnScope = (columnScope ?? []).every((scope) => scope.type === "attributeScope");

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

    const isTotalHeader = isTotal || isTotalGroup;
    const isSubtotalHeader = isSubtotal || isSubtotalGroup;
    const isValueOrTotal =
        isValueColumnDefinition(columnDefinition) ||
        isGrandTotalColumnDefinition(columnDefinition) ||
        isSubtotalColumnDefinition(columnDefinition);
    const isMetricHeader = isValueOrTotal && !isPartOfColumnGroup && !isAttributeOnlyColumnScope;
    const isFirstOfGroup = indexWithinGroup === 0;

    const isTransposed = columnDefinition?.isTransposed ?? false;

    return e("header-cell", {
        total: isTotalHeader,
        subtotal: isSubtotalHeader,
        metric: isMetricHeader,
        "first-of-group": isFirstOfGroup,
        "transposed-left-border": isTransposed && (isValueOrTotal || isTotalHeader),
    });
};
