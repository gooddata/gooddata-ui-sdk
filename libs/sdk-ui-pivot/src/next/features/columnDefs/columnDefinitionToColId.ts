// (C) 2024-2025 GoodData Corporation
import { ITableColumnDefinition, ITableDataHeaderScope, UnexpectedSdkError } from "@gooddata/sdk-ui";
import { assertNever, IAttributeDescriptor } from "@gooddata/sdk-model";
import { ColumnHeadersPosition } from "../../types/public.js";
import {
    ATTRIBUTE_EMPTY_VALUE,
    METRIC_GROUP_NAME_COL_DEF_ID,
    METRIC_GROUP_VALUE_COL_DEF_ID,
    PIVOT_ATTRIBUTE_COLUMN_GROUP_SEPARATOR,
} from "../../constants/internal.js";
import { AG_GRID_PIVOT_RESULT_FIELD_SEPARATOR } from "../../constants/agGrid.js";

/**
 * @internal
 */
export function columnDefinitionToColId(
    cell: ITableColumnDefinition,
    isTransposed: boolean,
    columnHeadersPosition: ColumnHeadersPosition,
): string {
    const columnPath = columnDefinitionToColumnPath(cell, isTransposed, columnHeadersPosition);
    return columnPath.join(AG_GRID_PIVOT_RESULT_FIELD_SEPARATOR);
}

/**
 * @internal
 */
export function columnDefinitionToColumnPath(
    cell: ITableColumnDefinition,
    isTransposed: boolean,
    columnHeadersPosition: ColumnHeadersPosition,
): string[] {
    switch (cell.type) {
        case "attribute":
            return [cell.attributeDescriptor.attributeHeader.localIdentifier];
        case "value":
        case "subtotal":
        case "grandTotal":
            return columnScopeToColumnPath(cell.columnScope, isTransposed, columnHeadersPosition);
        case "measureGroupHeader":
            if (isTransposed && columnHeadersPosition === "left") {
                return columnScopeToColumnPathWithHeadersOnLeft(cell.attributeDescriptors);
            }
            return [METRIC_GROUP_NAME_COL_DEF_ID];
        case "measureGroupValue":
            return [METRIC_GROUP_VALUE_COL_DEF_ID];
        default:
            assertNever(cell);
            throw new UnexpectedSdkError(
                `columnDefinitionToColumnPath: unexpected cell: ${JSON.stringify(cell)}`,
            );
    }
}

function columnScopeToColumnPathWithHeadersOnLeft(attributeDescriptors: IAttributeDescriptor[]): string[] {
    return attributeDescriptors.map((d) => d.attributeHeader.formOf.name);
}

function columnScopeToColumnPath(
    columnScope: ITableDataHeaderScope[],
    isTransposed: boolean,
    columnHeadersPosition: ColumnHeadersPosition,
): string[] {
    const groups: string[] = [];
    const values: string[] = [];
    const parts: string[] = [];
    columnScope.forEach((scope) => {
        if (scope.type === "attributeScope") {
            groups.push(scope.descriptor.attributeHeader.formOf.name);
            values.push(
                scope.header.attributeHeaderItem.formattedName ??
                    scope.header.attributeHeaderItem.name ??
                    ATTRIBUTE_EMPTY_VALUE,
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

    return parts;
}
