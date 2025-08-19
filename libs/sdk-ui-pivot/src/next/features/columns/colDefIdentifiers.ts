// (C) 2024-2025 GoodData Corporation
import { IAttributeDescriptor, assertNever } from "@gooddata/sdk-model";
import { ITableColumnDefinition, ITableDataHeaderScope, UnexpectedSdkError } from "@gooddata/sdk-ui";

import {
    MEASURE_GROUP_HEADER_COL_DEF_ID,
    MEASURE_GROUP_VALUE_COL_DEF_ID,
    PIVOTING_GROUP_SEPARATOR,
} from "../../constants/internal.js";
import { ColumnHeadersPosition } from "../../types/transposition.js";

/**
 * Creates unique identifiers path for provided column def.
 * Uses local identifiers for identifying attributes and measures, and attribute header values when pivoting.
 *
 * **Example results for simple columns (non-pivoted):**
 *
 * For non-pivoted row attributes:
 * ```
 * ["attrLocalId"]
 * ```
 * For non-pivoted measures:
 * ```
 * ["measureLocalId"]
 * ```
 *
 * **Example results for pivoted columns:**
 *
 * First identifier is always pivoting group (see {@link PIVOTING_GROUP_SEPARATOR}):
 * ```
 * ["pivotAttr1LocalId > pivotAttr2LocalId", ...]
 * ```
 * Identifiers next in the order are always attribute header values
 * ```
 * [..., "pivotAttr1HeaderValue", "pivotAttr2HeaderValue", ...]
 * ```
 * Last identifier could be measure local identifier - but it's there only if measures are not transposed (rendered in rows).
 * ```
 * [..., "measureLocalId"]
 * ```
 *
 * **Example results for pivoted columns + transposition + columns header position on left:**
 * If column headers position is on the left side, identifiers are only pivoting attribute local identifiers.
 * ```
 * ["pivotAttr1LocalId", "pivotAttr2LocalId"]
 * ```
 *
 * @internal
 */
export function columnDefinitionToColDefIdentifiers(
    column: ITableColumnDefinition,
    columnHeadersPosition: ColumnHeadersPosition,
): string[] {
    switch (column.type) {
        case "attribute":
            return [column.attributeDescriptor.attributeHeader.localIdentifier];
        case "value":
        case "subtotal":
        case "grandTotal":
            return columnScopeToIdentifiers(column.columnScope, column.isTransposed, columnHeadersPosition);
        case "measureGroupHeader":
            if (columnHeadersPosition === "left") {
                return columnScopeToIdentifiersWithHeadersPositionOnLeft(column.attributeDescriptors);
            }
            return [MEASURE_GROUP_HEADER_COL_DEF_ID];
        case "measureGroupValue":
            return [MEASURE_GROUP_VALUE_COL_DEF_ID];
        default:
            assertNever(column);
            throw new UnexpectedSdkError(
                `columnDefinitionToColumnPath: unexpected column: ${JSON.stringify(column)}`,
            );
    }
}

function columnScopeToIdentifiersWithHeadersPositionOnLeft(
    attributeDescriptors: IAttributeDescriptor[],
): string[] {
    return attributeDescriptors.map((d) => d.attributeHeader.localIdentifier);
}

function columnScopeToIdentifiers(
    columnScope: ITableDataHeaderScope[],
    isTransposed: boolean,
    columnHeadersPosition: ColumnHeadersPosition,
): string[] {
    const groups: string[] = [];
    const values: string[] = [];
    const parts: string[] = [];
    columnScope.forEach((scope) => {
        if (scope.type === "attributeScope") {
            groups.push(scope.descriptor.attributeHeader.localIdentifier);
            values.push(scope.header.attributeHeaderItem.uri);
        } else if (scope.type === "attributeTotalScope") {
            groups.push(scope.descriptor.attributeHeader.localIdentifier);
            values.push(scope.header.totalHeaderItem.type);
        } else if (scope.type === "measureScope") {
            values.push(scope.descriptor.measureHeaderItem.localIdentifier);
        } else if (scope.type === "measureTotalScope") {
            values.push(scope.descriptor.measureHeaderItem.localIdentifier);
        }
    });

    const joinedGroup = groups.join(PIVOTING_GROUP_SEPARATOR);

    const hasHeadersOnLeft = columnHeadersPosition === "left" && isTransposed;

    if (!hasHeadersOnLeft && joinedGroup) {
        parts.push(joinedGroup);
    }

    if (values.length) {
        parts.push(...values);
    }

    return parts;
}
