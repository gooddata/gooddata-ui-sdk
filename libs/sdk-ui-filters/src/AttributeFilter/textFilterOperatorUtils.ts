// (C) 2007-2026 GoodData Corporation

import {
    type IAttributeFilter,
    type MatchFilterOperator,
    type ObjRef,
    isArbitraryAttributeFilter,
    isMatchAttributeFilter,
    newArbitraryAttributeFilter,
    newMatchAttributeFilter,
} from "@gooddata/sdk-model";

/**
 * Text filter operator - determines filter type and behavior.
 * Maps to Figma design operator dropdown options.
 *
 * @alpha
 */
export type TextFilterOperator =
    | "all" // All values (no filtering)
    | "is" // Arbitrary positive
    | "contains" // Like contains positive
    | "startsWith" // Like startsWith positive
    | "endsWith" // Like endsWith positive
    | TextFilterNegativeOperator;

/**
 * Negative text filter operators (isNot, doesNotContain, etc.).
 *
 * @alpha
 */
export type TextFilterNegativeOperator = "isNot" | "doesNotContain" | "doesNotStartWith" | "doesNotEndWith";

/**
 * Determines if operator is the "all" operator (no filtering).
 *
 * @alpha
 */
export function isAllOperator(operator: TextFilterOperator): boolean {
    return operator === "all";
}

/**
 * Determines if operator uses arbitrary filter (chips/pills input).
 *
 * @alpha
 */
export function isArbitraryOperator(operator: TextFilterOperator): boolean {
    return operator === "is" || operator === "isNot";
}

/**
 * Determines if operator uses match filter (single text input).
 *
 * @alpha
 */
export function isMatchOperator(operator: TextFilterOperator): boolean {
    return !isArbitraryOperator(operator) && !isAllOperator(operator);
}

/**
 * Get text filter operator from filter.
 *
 * @alpha
 */
export function getOperatorFromFilter(filter: IAttributeFilter | undefined): TextFilterOperator {
    if (!filter) {
        return "all";
    }

    if (isArbitraryAttributeFilter(filter)) {
        const { values, negativeSelection } = filter.arbitraryAttributeFilter;
        if (values.length === 0 && negativeSelection) {
            return "all";
        }
        return negativeSelection ? "isNot" : "is";
    }

    if (isMatchAttributeFilter(filter)) {
        const { operator, negativeSelection } = filter.matchAttributeFilter;

        // Other operators
        const baseOperator = operator;
        const isNegative = negativeSelection ?? false;

        if (baseOperator === "contains") {
            return isNegative ? "doesNotContain" : "contains";
        }
        if (baseOperator === "startsWith") {
            return isNegative ? "doesNotStartWith" : "startsWith";
        }
        if (baseOperator === "endsWith") {
            return isNegative ? "doesNotEndWith" : "endsWith";
        }
    }

    return "all";
}

/**
 * Convert text operator to match operator and negation flag.
 *
 * @alpha
 */
export function operatorToMatchOperator(operator: TextFilterOperator): {
    matchOperator: MatchFilterOperator;
    negativeSelection: boolean;
} {
    switch (operator) {
        case "contains":
            return { matchOperator: "contains", negativeSelection: false };
        case "doesNotContain":
            return { matchOperator: "contains", negativeSelection: true };
        case "startsWith":
            return { matchOperator: "startsWith", negativeSelection: false };
        case "doesNotStartWith":
            return { matchOperator: "startsWith", negativeSelection: true };
        case "endsWith":
            return { matchOperator: "endsWith", negativeSelection: false };
        case "doesNotEndWith":
            return { matchOperator: "endsWith", negativeSelection: true };
        default:
            return { matchOperator: "contains", negativeSelection: false };
    }
}

/**
 * Create filter from operator, values/literal, and display form.
 *
 * @alpha
 */
export function createFilterFromOperator(
    operator: TextFilterOperator,
    valuesOrLiteral: Array<string | null> | string,
    displayForm: ObjRef,
    localIdentifier?: string,
    caseSensitive: boolean = false,
): IAttributeFilter {
    if (isAllOperator(operator)) {
        return newArbitraryAttributeFilter(displayForm, [], true, localIdentifier);
    }

    if (isArbitraryOperator(operator)) {
        const values = Array.isArray(valuesOrLiteral) ? valuesOrLiteral : [valuesOrLiteral];
        const negativeSelection = operator === "isNot";
        return newArbitraryAttributeFilter(displayForm, values, negativeSelection, localIdentifier);
    }

    // Match operators
    const literal = Array.isArray(valuesOrLiteral) ? valuesOrLiteral[0] || "" : valuesOrLiteral;
    const { matchOperator, negativeSelection } = operatorToMatchOperator(operator);

    return newMatchAttributeFilter(
        displayForm,
        matchOperator,
        literal,
        { caseSensitive, negativeSelection },
        localIdentifier,
    );
}

/**
 * Get values/literal from filter based on operator type.
 *
 * @alpha
 */
export function getValuesFromFilter(filter: IAttributeFilter | undefined): Array<string | null> | string {
    if (!filter) {
        return [];
    }

    if (isArbitraryAttributeFilter(filter)) {
        return filter.arbitraryAttributeFilter.values;
    }

    if (isMatchAttributeFilter(filter)) {
        return filter.matchAttributeFilter.literal;
    }

    return [];
}

/**
 * Resolves next draft values when switching text operator.
 * Resets values when switching between arbitrary (in/not in) and match operators.
 * Keeps values when switching within the same operator group.
 *
 * @alpha
 */
export function resolveValuesOnTextOperatorChange(
    newOperator: TextFilterOperator,
    oldOperator: TextFilterOperator,
    oldValues: Array<string | null>,
    oldLiteral: string,
): { values: Array<string | null>; literal: string } {
    const wasAll = isAllOperator(oldOperator);
    const isAll = isAllOperator(newOperator);
    const wasArbitrary = isArbitraryOperator(oldOperator);
    const isArbitrary = isArbitraryOperator(newOperator);

    // Switching to "all" always resets
    if (isAll) {
        return { values: [], literal: "" };
    }

    // Switching from "all" to arbitrary or match resets
    if (wasAll) {
        return { values: [], literal: "" };
    }

    // Same group: arbitrary (is/isNot) - keep selected values
    if (wasArbitrary && isArbitrary) {
        return { values: oldValues, literal: "" };
    }

    // Same group: match (contains/startsWith/etc) - keep literal
    if (!wasArbitrary && !isArbitrary) {
        return { values: [], literal: oldLiteral };
    }

    // Cross-group: reset values
    return { values: [], literal: "" };
}
