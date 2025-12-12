// (C) 2024-2025 GoodData Corporation

import { type IntlShape } from "react-intl";

import { type IAttributeDescriptor, assertNever } from "@gooddata/sdk-model";
import {
    type ITableColumnDefinition,
    type ITableDataHeaderScope,
    UnexpectedSdkError,
} from "@gooddata/sdk-ui";

import {
    MEASURE_GROUP_HEADER_COL_DEF_ID,
    MEASURE_GROUP_VALUE_COL_DEF_ID,
    PIVOTING_GROUP_SEPARATOR,
} from "../../constants/internal.js";
import { type ColumnHeadersPosition } from "../../types/transposition.js";
import { extractIntlTotalHeaderValue, getAttributeHeaderName } from "../columns/shared.js";

/**
 * Creates header names path for provided column def.
 * Uses label name for attributes, measure name for measures and attribute header values when pivoting.
 *
 * **Example results for simple columns (non-pivoted):**
 *
 * For non-pivoted row attributes:
 * ```
 * ["Country"]
 * ```
 * For non-pivoted measures:
 * ```
 * ["Sum of Sales"]
 * ```
 *
 * **Example results for pivoted columns:**
 *
 * First identifier is always pivoting group (see {@link PIVOTING_GROUP_SEPARATOR}):
 * ```
 * ["Country > Region", ...]
 * ```
 * Identifiers next in the order are always attribute header values
 * ```
 * [..., "USA", "New York", ...]
 * ```
 * Last identifier could be measure name - but it's there only if measures are not transposed (rendered in rows).
 * ```
 * [..., "Sum of Sales"]
 * ```
 *
 * **Example results for pivoted columns + transposition + columns header position on left:**
 *
 * If column headers position is on the left side, identifiers are only pivoting label names.
 * ```
 * ["Country", "Region"]
 * ```
 *
 * @internal
 */
export function columnDefinitionToHeaderNames(
    column: ITableColumnDefinition,
    columnHeadersPosition: ColumnHeadersPosition,
    intl: IntlShape,
): string[] {
    switch (column.type) {
        case "attribute":
            return [column.attributeDescriptor.attributeHeader.name];
        case "value":
        case "subtotal":
        case "grandTotal":
            return columnScopeHeaderNames(
                column.columnScope,
                column.isTransposed,
                columnHeadersPosition,
                intl,
            );
        case "measureGroupHeader":
            if (columnHeadersPosition === "left") {
                return columnScopeToHeaderNamesWithHeadersPositionOnLeft(column.attributeDescriptors);
            }
            return [MEASURE_GROUP_HEADER_COL_DEF_ID];
        case "measureGroupValue":
            return [MEASURE_GROUP_VALUE_COL_DEF_ID];
        default:
            assertNever(column);
            throw new UnexpectedSdkError(
                `columnDefinitionToColumnPath: unexpected column definition: ${JSON.stringify(column)}`,
            );
    }
}

function columnScopeToHeaderNamesWithHeadersPositionOnLeft(
    attributeDescriptors: IAttributeDescriptor[],
): string[] {
    return attributeDescriptors.map((d) => d.attributeHeader.formOf.name);
}

function columnScopeHeaderNames(
    columnScope: ITableDataHeaderScope[],
    isTransposed: boolean,
    columnHeadersPosition: ColumnHeadersPosition,
    intl: IntlShape,
): string[] {
    const groups: string[] = [];
    const values: string[] = [];
    const parts: string[] = [];
    columnScope.forEach((scope) => {
        if (scope.type === "attributeScope") {
            groups.push(scope.descriptor.attributeHeader.formOf.name);
            values.push(getAttributeHeaderName(scope.header, intl));
        } else if (scope.type === "attributeTotalScope") {
            groups.push(scope.descriptor.attributeHeader.formOf.name);
            const localizedHeaderName = extractIntlTotalHeaderValue(scope.header, intl);
            values.push(localizedHeaderName);
        } else if (scope.type === "measureScope") {
            values.push(scope.descriptor.measureHeaderItem.name);
        } else if (scope.type === "measureTotalScope") {
            values.push(scope.descriptor.measureHeaderItem.name);
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
