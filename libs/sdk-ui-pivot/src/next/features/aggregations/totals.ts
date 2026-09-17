// (C) 2026 GoodData Corporation

import { type ITotal, type TotalType } from "@gooddata/sdk-model";
import type { BucketNames } from "@gooddata/sdk-ui";

import { DEFAULT_TOTAL_FUNCTIONS } from "../../constants/internal.js";

/**
 * Buckets that can contain pivot-table totals whose labels are editable.
 */
export type TotalLabelBucketType = typeof BucketNames.ATTRIBUTE | typeof BucketNames.COLUMNS;

/**
 * Converts the backend result-header total code (for example, `SUM`) to the SDK total type.
 */
export function getResultTotalType(type: string | undefined): TotalType | undefined {
    const normalizedType = type?.toLowerCase() as TotalType | undefined;
    return normalizedType && DEFAULT_TOTAL_FUNCTIONS.includes(normalizedType) ? normalizedType : undefined;
}

/**
 * Tests whether two totals describe the same calculation. The alias is deliberately ignored because
 * it changes only the displayed label, not the identity of the total.
 */
export function areTotalsSameDefinition(first: ITotal, second: ITotal): boolean {
    return (
        first.type === second.type &&
        first.measureIdentifier === second.measureIdentifier &&
        first.attributeIdentifier === second.attributeIdentifier
    );
}

export function getTotalAlias(
    totals: ITotal[],
    type: TotalType,
    attributeIdentifier: string,
    measureIdentifier?: string,
): string | undefined {
    return totals.find(
        (total) =>
            total.type === type &&
            total.attributeIdentifier === attributeIdentifier &&
            (measureIdentifier === undefined || total.measureIdentifier === measureIdentifier) &&
            total.alias,
    )?.alias;
}

/**
 * Resolves each definition's inherited alias independently (not just the first definition's,
 * broadcast to the rest) - a single call can carry definitions for several measures under the same
 * attribute (see constructAggregationsMenuItems), and when scopeToMeasure is true that is exactly
 * the case scopeToMeasure exists to keep separate: one measure's alias must never leak onto another
 * measure's total just because they share a position in the same definitions array.
 */
export function withInheritedAlias(
    currentTotals: ITotal[],
    definitions: ITotal[],
    scopeToMeasure: boolean,
): ITotal[] {
    let changed = false;

    const updatedDefinitions = definitions.map((definition) => {
        const existingAlias = getTotalAlias(
            currentTotals,
            definition.type,
            definition.attributeIdentifier,
            scopeToMeasure ? definition.measureIdentifier : undefined,
        );

        if (!existingAlias) {
            return definition;
        }

        changed = true;
        return { ...definition, alias: existingAlias };
    });

    return changed ? updatedDefinitions : definitions;
}

/**
 * Updates the custom label on all matching totals (or just the matching measure's, see
 * `getTotalAlias`). Returns `undefined` when no total matches, or when every matching total
 * already had this exact alias - callers push the result as a properties change, and a
 * content-identical array would register as a dirty/unsaved change for nothing (e.g. "Reset to
 * default" on an already-default total, or re-saving the same label).
 */
export function updateTotalAlias(
    totals: ITotal[],
    type: TotalType,
    attributeIdentifier: string,
    alias: string | undefined,
    measureIdentifier?: string,
): ITotal[] | undefined {
    const trimmedAlias = alias?.trim() || undefined;
    let matchFound = false;
    let changed = false;

    const updatedTotals = totals.map((total) => {
        if (
            total.type !== type ||
            total.attributeIdentifier !== attributeIdentifier ||
            (measureIdentifier !== undefined && total.measureIdentifier !== measureIdentifier)
        ) {
            return total;
        }

        matchFound = true;
        if (total.alias === trimmedAlias) {
            return total;
        }
        changed = true;

        if (!trimmedAlias) {
            const { alias: _alias, ...totalWithoutAlias } = total;
            return totalWithoutAlias;
        }

        return { ...total, alias: trimmedAlias };
    });

    return matchFound && changed ? updatedTotals : undefined;
}
