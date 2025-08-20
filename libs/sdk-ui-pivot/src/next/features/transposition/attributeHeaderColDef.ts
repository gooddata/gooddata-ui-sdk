// (C) 2025 GoodData Corporation
import { IntlShape } from "react-intl";

import { ITableValueColumnDefinition, emptyHeaderTitleFromIntl } from "@gooddata/sdk-ui";

import { AgGridColumnDef } from "../../types/agGrid.js";
import { extractFormattedValue, metricCellRenderer } from "../columns/shared.js";
import { getHeaderCellClassName } from "../styling/headerCell.js";

/**
 * Creates attribute header col def (for transposed table).
 *
 * @internal
 */
export function createAttributeHeaderColDef(
    colId: string,
    columnDefinition: ITableValueColumnDefinition & ({ isTransposed: true } | { isEmpty: true }),
    intl: IntlShape,
): AgGridColumnDef {
    const { attributeHeader } = columnDefinition;
    return {
        colId,
        field: `cellDataByColId.${colId}.formattedValue`,
        context: {
            columnDefinition,
        },
        headerName:
            attributeHeader.attributeHeaderItem.formattedName ??
            attributeHeader.attributeHeaderItem.name ??
            attributeHeader.attributeHeaderItem.uri ??
            emptyHeaderTitleFromIntl(intl),
        valueGetter: (params) => {
            return extractFormattedValue(params, colId);
        },
        headerClass: getHeaderCellClassName,
        cellRenderer: metricCellRenderer,
        headerComponent: "AttributeHeader",
        sortable: false,
    };
}
