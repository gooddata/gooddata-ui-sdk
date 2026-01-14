// (C) 2025-2026 GoodData Corporation

import { type MeasureValueFilterOperator } from "../types.js";

/**
 * Determines whether zero falls within the interval defined by the measure value filter operator and values.
 * This is used to conditionally show the "Treat blank values as 0" checkbox - it should only be shown
 * when zero is part of the filter interval (since treating blanks as zero would affect the results).
 *
 * @param operator - The comparison or range operator used in the filter
 * @param value - The value for comparison operators or the "from" value for range operators
 * @param to - The "to" value for range operators (optional, only used with BETWEEN/NOT_BETWEEN)
 * @returns true if zero is included in the interval, false otherwise. Returns true for undefined values
 *          to show the checkbox by default when no value has been entered yet.
 *
 * @example
 * ```typescript
 * // Greater than 2000 creates interval [2000, ∞) which does NOT include zero
 * intervalIncludesZero("GREATER_THAN", 2000) // returns false
 *
 * // Less than 10 creates interval (-∞, 10) which DOES include zero
 * intervalIncludesZero("LESS_THAN", 10) // returns true
 *
 * // Between -5 and 5 creates interval [-5, 5] which DOES include zero
 * intervalIncludesZero("BETWEEN", -5, 5) // returns true
 *
 * // Between 10 and 20 creates interval [10, 20] which does NOT include zero
 * intervalIncludesZero("BETWEEN", 10, 20) // returns false
 *
 * // Undefined value returns true (show checkbox by default)
 * intervalIncludesZero("GREATER_THAN", undefined) // returns true
 * ```
 *
 * @internal
 */
export function intervalIncludesZero(
    operator: MeasureValueFilterOperator,
    value?: number,
    to?: number,
): boolean {
    // If operator is ALL, all values are included
    if (operator === "ALL") {
        return true;
    }

    // For undefined values, return true to show the checkbox by default
    if (value === undefined) {
        return true;
    }

    switch (operator) {
        // Comparison operators
        case "GREATER_THAN":
            // Interval: (value, ∞)
            // Zero is included if value < 0
            return value < 0;

        case "GREATER_THAN_OR_EQUAL_TO":
            // Interval: [value, ∞)
            // Zero is included if value <= 0
            return value <= 0;

        case "LESS_THAN":
            // Interval: (-∞, value)
            // Zero is included if value > 0
            return value > 0;

        case "LESS_THAN_OR_EQUAL_TO":
            // Interval: (-∞, value]
            // Zero is included if value >= 0
            return value >= 0;

        case "EQUAL_TO":
            // Interval: {value}
            // Zero is included if value == 0
            return value === 0;

        case "NOT_EQUAL_TO":
            // Interval: ℝ \ {value}
            // Zero is included if value != 0
            return value !== 0;

        // Range operators
        case "BETWEEN":
            // Interval: [from, to]
            // Zero is included if from <= 0 AND to >= 0
            // If 'to' is undefined (incomplete range), return true to show checkbox
            if (to === undefined) {
                return true;
            }
            if (value === undefined) {
                return true;
            }
            return value <= 0 && to >= 0;

        case "NOT_BETWEEN":
            // Interval: (-∞, from) ∪ (to, ∞)
            // Zero is included if from > 0 OR to < 0
            // If 'to' is undefined (incomplete range), return true to show checkbox
            if (to === undefined) {
                return true;
            }
            if (value === undefined) {
                return true;
            }
            return value > 0 || to < 0;

        default:
            return false;
    }
}
