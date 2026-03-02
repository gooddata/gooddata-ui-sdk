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
    return !isArbitraryOperator(operator);
}

export function isNegativeOperator(operator: TextFilterOperator): boolean {
    return (
        operator === "isNot" ||
        operator === "doesNotContain" ||
        operator === "doesNotStartWith" ||
        operator === "doesNotEndWith"
    );
}

/**
 * Get text filter operator from filter.
 *
 * @alpha
 */
export function getOperatorFromFilter(filter: IAttributeFilter | undefined): TextFilterOperator {
    if (!filter) {
        return "is";
    }

    if (isArbitraryAttributeFilter(filter)) {
        return (filter.arbitraryAttributeFilter.negativeSelection ?? false) ? "isNot" : "is";
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

    return "is";
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
    valuesOrLiteral: string[] | string,
    displayForm: ObjRef,
    localIdentifier?: string,
    caseSensitive: boolean = false,
): IAttributeFilter {
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
export function getValuesFromFilter(filter: IAttributeFilter | undefined): string[] | string {
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
    oldValues: string[],
    oldLiteral: string,
): { values: string[]; literal: string } {
    const wasArbitrary = isArbitraryOperator(oldOperator);
    const isArbitrary = isArbitraryOperator(newOperator);

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
