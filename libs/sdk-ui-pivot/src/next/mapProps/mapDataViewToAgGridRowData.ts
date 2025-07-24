// (C) 2024-2025 GoodData Corporation
import { DataViewFacade, ITableColumnDefinition, ITableDataHeaderScope } from "@gooddata/sdk-ui";
import { ColumnHeadersPosition } from "../types/public.js";
import { AgGridRowData } from "../types/internal.js";
import {
    METRIC_GROUP_NAME_COL_DEF_ID,
    METRIC_GROUP_VALUE_COL_DEF_ID,
    PIVOT_ATTRIBUTE_COLUMN_GROUP_SEPARATOR,
} from "../constants/internal.js";
import { AG_GRID_PIVOT_RESULT_FIELD_SEPARATOR } from "../constants/agGrid.js";
import { assertNever, IAttributeDescriptor } from "@gooddata/sdk-model";

/**
 * Object of pivot result field metadata
 *
 * @internal
 */
export interface ITableColumnDefinitionByPivotOrLocalId {
    [pivotOrLocalId: string]: ITableColumnDefinition;
}

/**
 * Map data view to ag-grid row data and pivot result fields.
 *
 * For standard data without pivoting, keys are metric or attribute local identifiers, and values are formatted values.
 * For pivoted data, keys are joined attribute label names, attribute values and metric local identifiers, and values are formatted metric values.
 *
 * @param dataView - Data view facade
 * @param columnHeadersPosition - Position of column headers ("top" or "left")
 */
export function mapDataViewToAgGridRowData(
    dataView: DataViewFacade,
    columnHeadersPosition: ColumnHeadersPosition = "top",
): {
    rowData: AgGridRowData[];
    grandTotalRowData: AgGridRowData[];
    pivotResultFields: string[];
    columnDefinitionByColId: ITableColumnDefinitionByPivotOrLocalId;
} {
    const tableData = dataView.data().asTable();
    const columnDefinitionByColId: ITableColumnDefinitionByPivotOrLocalId = {};
    const pivotResultFields: string[] = [];

    tableData.columnDefinitions.forEach((columnDefinition) => {
        const key = buildColumnKey(columnDefinition, tableData.isTransposed, columnHeadersPosition);
        pivotResultFields.push(key);
        columnDefinitionByColId[key] = columnDefinition;
    });

    const rowData: AgGridRowData[] = [];
    const grandTotalRowData: AgGridRowData[] = [];

    tableData.data.forEach((row, rowIndex) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const data: AgGridRowData = { meta: {} as Record<string, ITableDataValue>, row: [] };

        row.forEach((cell) => {
            const key = buildColumnKey(cell.columnDefinition, tableData.isTransposed, columnHeadersPosition);
            data[key] = cell.formattedValue;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            data.meta[key] = cell;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            data.row.push(cell.value);
        });

        if (tableData.rowDefinitions[rowIndex].type === "grandTotal") {
            grandTotalRowData.push(data);
        } else {
            rowData.push(data);
        }
    });

    return {
        columnDefinitionByColId,
        rowData,
        grandTotalRowData,
        pivotResultFields: tableData.isPivoted ? pivotResultFields : [],
    };
}

function buildColumnKey(
    cell: ITableColumnDefinition,
    isTransposed: boolean,
    columnHeadersPosition: ColumnHeadersPosition,
): string {
    if (cell.type === "attribute") {
        return cell.attributeDescriptor.attributeHeader.localIdentifier;
    } else if (cell.type === "value") {
        return buildColumnScopeKey(cell.columnScope, isTransposed, columnHeadersPosition);
    } else if (cell.type === "subtotal") {
        return buildColumnScopeKey(cell.columnScope, isTransposed, columnHeadersPosition);
    } else if (cell.type === "grandTotal") {
        return buildColumnScopeKey(cell.columnScope, isTransposed, columnHeadersPosition);
    } else if (cell.type === "measureGroupHeader") {
        if (isTransposed && columnHeadersPosition === "left") {
            return buildColumnScopeKeyLeft(cell.attributeDescriptors);
        }
        return METRIC_GROUP_NAME_COL_DEF_ID;
    } else if (cell.type === "measureGroupValue") {
        return METRIC_GROUP_VALUE_COL_DEF_ID;
    } else {
        assertNever(cell);
        return "";
    }
}

function buildColumnScopeKey(
    columnScope: ITableDataHeaderScope[],
    isTransposed: boolean,
    columnHeadersPosition: ColumnHeadersPosition,
): string {
    const groups: string[] = [];
    const values: string[] = [];
    const parts: string[] = [];
    columnScope.forEach((scope) => {
        if (scope.type === "attributeScope") {
            groups.push(scope.descriptor.attributeHeader.formOf.name);
            values.push(
                scope.header.attributeHeaderItem.formattedName ??
                    scope.header.attributeHeaderItem.name ??
                    "(empty value)",
            );
        } else if (scope.type === "attributeTotalScope") {
            groups.push(scope.descriptor.attributeHeader.formOf.name);
            values.push(scope.header.totalHeaderItem.name);
        } else if (scope.type === "measureScope") {
            values.push(scope.descriptor.measureHeaderItem.localIdentifier);
        } else if (scope.type === "measureTotalScope") {
            values.push(scope.descriptor.measureHeaderItem.name);
        }
    });

    const joinedGroup = groups.join(PIVOT_ATTRIBUTE_COLUMN_GROUP_SEPARATOR);
    const hasHeadersOnLeft = columnHeadersPosition === "left" && isTransposed;
    if (!hasHeadersOnLeft && joinedGroup) {
        parts.push(joinedGroup);
    }
    if (values.length) {
        parts.push(...values);
    }

    return parts.join(AG_GRID_PIVOT_RESULT_FIELD_SEPARATOR);
}

function buildColumnScopeKeyLeft(attributeDescriptors: IAttributeDescriptor[]): string {
    return attributeDescriptors
        .map((d) => d.attributeHeader.formOf.name)
        .join(AG_GRID_PIVOT_RESULT_FIELD_SEPARATOR);
}
