// (C) 2025-2026 GoodData Corporation

import { type IDataTooLargeResponseBodyLimitBreak } from "@gooddata/sdk-backend-spi";

/////
// Crosstabulation limit types
/////

// source of truth for all the possible crosstabulation limit types.
// done like this so that all the derived types are automatically updated whenever this changes.
const crosstabulationLimitTypes = ["xtab-rows", "xtab-columns", "xtab-cells"] as const;

// auxiliary set used mainly in type guards. typed as Set<string> to make using them in type guards easier
const crosstabulationLimitTypesSet: Set<string> = new Set(crosstabulationLimitTypes);

/**
 * All the limit types related to the crosstabulation operation.
 */
export type CrosstabulationLimitType = (typeof crosstabulationLimitTypes)[number];

/**
 * Type guard narrowing the general LimitBreaks to only those related to crosstabulation.
 */
export function isOnlyCrosstabulationLimitBreaks(
    items: IDataTooLargeResponseBodyLimitBreak[],
): items is IDataTooLargeResponseBodyLimitBreak<CrosstabulationLimitType>[] {
    return items.every((i) => crosstabulationLimitTypesSet.has(i.limitType));
}

/////
// Calculation limit types
/////

// source of truth for all the possible SQL calculation limit types.
// done like this so that all the derived types are automatically updated whenever this changes.
const calculationLimitTypes = ["sql-cumulative-table-bytes"] as const;

// auxiliary set used mainly in type guards. typed as Set<string> to make using them in type guards easier
const calculationLimitTypesSet: Set<string> = new Set(calculationLimitTypes);

/**
 * All the limit types related to the SQL calculation.
 */
export type CalculationLimitType = (typeof calculationLimitTypes)[number];

/**
 * Type guard narrowing the general LimitBreaks to only those related to SQL calculation.
 */
export function isOnlyCalculationLimitBreaks(
    items: IDataTooLargeResponseBodyLimitBreak[],
): items is IDataTooLargeResponseBodyLimitBreak<CalculationLimitType>[] {
    return items.every((i) => calculationLimitTypesSet.has(i.limitType));
}
