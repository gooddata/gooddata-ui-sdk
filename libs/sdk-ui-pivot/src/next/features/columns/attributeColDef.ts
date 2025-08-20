// (C) 2025 GoodData Corporation
import { IntlShape } from "react-intl";

import {
    DataViewFacade,
    ExplicitDrill,
    ITableAttributeColumnDefinition,
    emptyHeaderTitleFromIntl,
} from "@gooddata/sdk-ui";

import { extractIntlFormattedValue } from "./shared.js";
import { AgGridCellRendererParams, AgGridColumnDef } from "../../types/agGrid.js";
import { HEADER_CELL_CLASSNAME } from "../styling/bem.js";
import { getCellClassName } from "../styling/cell.js";

/**
 * Creates col def for row attribute.
 *
 * @internal
 */
export function createAttributeColDef(
    colId: string,
    columnDefinition: ITableAttributeColumnDefinition,
    intl: IntlShape,
    drillableItems?: ExplicitDrill[],
    dv?: DataViewFacade,
): AgGridColumnDef {
    const { attributeDescriptor } = columnDefinition;
    const attributeLocalIdentifier = attributeDescriptor.attributeHeader.localIdentifier;

    return {
        colId,
        field: `cellDataByColId.${colId}.formattedValue`,
        headerName: attributeDescriptor.attributeHeader.formOf.name,
        headerClass: HEADER_CELL_CLASSNAME,
        cellClass: (params) => {
            return getCellClassName(params, drillableItems, dv);
        },
        valueGetter: (params) => {
            return extractIntlFormattedValue(params, colId, intl);
        },
        context: {
            columnDefinition,
        },
        cellRenderer: (params: AgGridCellRendererParams) => {
            const value = params.value;
            if (!value) {
                return emptyHeaderTitleFromIntl(intl);
            }

            // Do not render repeating attribute values.
            const rowIndex = params.node.rowIndex;
            const previousRow = rowIndex ? params.api.getDisplayedRowAtIndex(rowIndex - 1) : null;
            const previousValue = extractIntlFormattedValue(previousRow, attributeLocalIdentifier, intl);
            const isSameValue = previousValue && previousValue === value;

            if (isSameValue) {
                return null;
            }

            return value;
        },
        headerComponentParams: {
            // We need to use inner component to preserve sorting interactions
            innerHeaderComponent: "AttributeHeader",
        },
    };
}
