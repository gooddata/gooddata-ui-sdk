// (C) 2025-2026 GoodData Corporation

import { type ITableColumnDefinition } from "@gooddata/sdk-ui";

import {
    createColumnWidthItemForColumnDefinition,
    createWeakColumnWidthItemForColumnDefinition,
} from "./createColumnWidthItemForColumnDefinition.js";
import { getColumnWidthItemValue } from "./getColumnWidthItemValue.js";
import { isColumnWidthItemMatch } from "./isColumnWidthItemMatch.js";
import { type ColumnWidthItem } from "../../types/resizing.js";

/**
 * Returns {@link ColumnWidthItem} for the provided {@link ITableColumnDefinition} if match is found, undefined otherwise.
 *
 * @internal
 */
export function getColumnWidthItemForColumnDefinition(
    columnDefinition: ITableColumnDefinition,
    columnWidths: ColumnWidthItem[],
): ColumnWidthItem | undefined {
    // Width is not compared for matching, we only need to find the item
    const columnWidthItem = createColumnWidthItemForColumnDefinition(columnDefinition, 0);
    const columnWeakWidthItem = createWeakColumnWidthItemForColumnDefinition(columnDefinition, 0);

    // We cannot use a single `find` here: the first match is not always the best match.
    // `columnWidths` may contain both exact and weak candidates, each with explicit or auto width.
    // Keep only the first hit in each bucket to preserve deterministic behavior based on existing array order.
    let firstExactMatchWithExplicitWidth: ColumnWidthItem | undefined;
    let firstExactMatch: ColumnWidthItem | undefined;
    let firstWeakMatchWithExplicitWidth: ColumnWidthItem | undefined;
    let firstWeakMatch: ColumnWidthItem | undefined;

    for (const candidateWidthItem of columnWidths) {
        // Exact match must win over weak match so that specific per-column widths are not overridden
        // by generic per-measure definitions.
        const exactMatch = isColumnWidthItemMatch(candidateWidthItem, columnWidthItem);
        if (exactMatch) {
            if (
                getColumnWidthItemValue(candidateWidthItem) !== undefined &&
                !firstExactMatchWithExplicitWidth
            ) {
                firstExactMatchWithExplicitWidth = candidateWidthItem;
            }
            if (!firstExactMatch) {
                firstExactMatch = candidateWidthItem;
            }
            continue;
        }

        // Weak match is a fallback for measure-level widths (legacy/interop scenarios).
        // Prefer explicit width over "auto" in the same weak bucket.
        const weakMatch = columnWeakWidthItem
            ? isColumnWidthItemMatch(candidateWidthItem, columnWeakWidthItem)
            : false;
        if (weakMatch) {
            if (
                getColumnWidthItemValue(candidateWidthItem) !== undefined &&
                !firstWeakMatchWithExplicitWidth
            ) {
                firstWeakMatchWithExplicitWidth = candidateWidthItem;
            }
            if (!firstWeakMatch) {
                firstWeakMatch = candidateWidthItem;
            }
        }
    }

    // Priority order:
    // 1) exact + explicit width
    // 2) exact
    // 3) weak + explicit width
    // 4) weak
    const matchingColumnWidthItem =
        firstExactMatchWithExplicitWidth ??
        firstExactMatch ??
        firstWeakMatchWithExplicitWidth ??
        firstWeakMatch;

    return matchingColumnWidthItem;
}
