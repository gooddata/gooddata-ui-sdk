// (C) 2026 GoodData Corporation

import { type IntlShape, type MessageDescriptor, defineMessages } from "react-intl";

import {
    type ISeparators,
    type MeasureValueFilterCondition,
    isComparisonCondition,
    isRangeCondition,
} from "@gooddata/sdk-model";
import { shortenNumber } from "@gooddata/sdk-ui-kit";

// Defining the i18n keys used by this helper via `defineMessages` so static i18n analysis
// (e.g. `i18n-toolkit`) sees them as referenced and validates their presence in bundles.
// Symbolic operator keys (`mvf.button.*`) drive the filter bar button label
// (e.g. "> 100", "≥ 50%"). Range operators reuse the verbose `mvf.operator.*.withValue`
// keys because there is no symbolic equivalent for "between" / "not between".
const messages = defineMessages({
    all: { id: "mvf.button.all" },
    or: { id: "mvf.conditionsJoiner.or" },
    rangeValues: { id: "mvf.button.range.values" },
    GREATER_THAN: { id: "mvf.button.greaterThan" },
    GREATER_THAN_OR_EQUAL_TO: { id: "mvf.button.greaterThanOrEqualTo" },
    LESS_THAN: { id: "mvf.button.lessThan" },
    LESS_THAN_OR_EQUAL_TO: { id: "mvf.button.lessThanOrEqualTo" },
    EQUAL_TO: { id: "mvf.button.equalTo" },
    NOT_EQUAL_TO: { id: "mvf.button.notEqualTo" },
    BETWEEN: { id: "mvf.operator.between.withValue" },
    NOT_BETWEEN: { id: "mvf.operator.notBetween.withValue" },
});

const COMPARISON_MESSAGES: Record<string, MessageDescriptor> = {
    GREATER_THAN: messages.GREATER_THAN,
    GREATER_THAN_OR_EQUAL_TO: messages.GREATER_THAN_OR_EQUAL_TO,
    LESS_THAN: messages.LESS_THAN,
    LESS_THAN_OR_EQUAL_TO: messages.LESS_THAN_OR_EQUAL_TO,
    EQUAL_TO: messages.EQUAL_TO,
    NOT_EQUAL_TO: messages.NOT_EQUAL_TO,
};

const RANGE_FULL_MESSAGES: Record<string, MessageDescriptor> = {
    BETWEEN: messages.BETWEEN,
    NOT_BETWEEN: messages.NOT_BETWEEN,
};

// The platform supports 6 decimal places.
const MAX_DECIMAL_PLACES = 6;
const DECIMAL_FACTOR = 10 ** MAX_DECIMAL_PLACES;

// Math.round avoids the toFixed → string → parseFloat round-trip, which is faster and
// sidesteps exponential-notation pitfalls toFixed has for very large or very small numbers.
const round = (n: number): number => Math.round(n * DECIMAL_FACTOR) / DECIMAL_FACTOR;

function formatValue(value: number, usePercentage: boolean, separators: ISeparators | undefined): string {
    const displayedValue = usePercentage ? round(value * 100) : value;
    const shortenedValue = shortenNumber(displayedValue, separators);
    return usePercentage ? `${shortenedValue}%` : shortenedValue;
}

interface IConditionLabelParts {
    /** Operator-keyed identity used for grouping consecutive same-operator conditions. */
    operatorKey: string;
    /** Full label including the operator (e.g. `"> 100"`, `"between 10 and 100"`). */
    fullLabel: string;
    /** Value-only label used for grouped repeats (e.g. `"100"`, `"30 and 40"`). */
    valueLabel: string;
}

function buildConditionLabelParts(
    intl: IntlShape,
    condition: MeasureValueFilterCondition,
    usePercentage: boolean,
    separators: ISeparators | undefined,
): IConditionLabelParts | null {
    if (isComparisonCondition(condition)) {
        const { operator, value } = condition.comparison;
        const message = COMPARISON_MESSAGES[operator];
        if (!message) {
            return null;
        }
        const formattedValue = formatValue(value, usePercentage, separators);
        return {
            operatorKey: operator,
            fullLabel: intl.formatMessage(message, { value: formattedValue }),
            valueLabel: formattedValue,
        };
    }
    if (isRangeCondition(condition)) {
        const { operator, from, to } = condition.range;
        const message = RANGE_FULL_MESSAGES[operator];
        if (!message) {
            return null;
        }
        const formattedFrom = formatValue(from, usePercentage, separators);
        const formattedTo = formatValue(to, usePercentage, separators);
        return {
            operatorKey: operator,
            fullLabel: intl.formatMessage(message, { from: formattedFrom, to: formattedTo }),
            valueLabel: intl.formatMessage(messages.rangeValues, {
                from: formattedFrom,
                to: formattedTo,
            }),
        };
    }
    return null;
}

/**
 * Options for {@link getMeasureValueFilterConditionLabel}.
 *
 * @internal
 */
export interface IMeasureValueFilterConditionLabelOptions {
    /**
     * Whether the metric is formatted as a percentage. When true, condition values are multiplied
     * by 100 and suffixed with `%`.
     */
    usePercentage?: boolean;

    /**
     * Number formatting separators (thousands, decimal). When omitted, library defaults are used.
     */
    separators?: ISeparators;
}

/**
 * Builds a short, symbolic summary string for a measure value filter's conditions, suitable for
 * a filter bar button label.
 *
 * @remarks
 * Comparison operators render as symbols (`>`, `≥`, `<`, `≤`, `=`, `≠`); range operators render
 * as words (`between ... and ...`). Use this helper for the dashboard MVF filter button and the
 * Analytical Designer MVF filter button so both stay visually consistent.
 *
 * Multi-condition behavior matches AD's grouping: same-operator conditions are grouped, the first
 * occurrence renders the full label, subsequent occurrences render value-only. Groups appear in
 * insertion order of their first occurrence and are joined with ` or `.
 *
 * Backed by SDK i18n keys: `mvf.button.*` (symbolic comparisons + `all`),
 * `mvf.operator.between.withValue` / `mvf.operator.notBetween.withValue` (range full),
 * `mvf.button.range.values` (range value-only), `mvf.conditionsJoiner.or` (multi-condition joiner).
 *
 * Examples (English):
 * - no conditions → `"All"`
 * - single comparison → `"> 100"`
 * - single range → `"between 10 and 100"`
 * - multi-condition different operators → `"> 100 or < 5"`
 * - multi-condition same operator → `"> 100 or 200"`
 * - percentage metric → `"> 50%"`
 *
 * @param intl - the active `IntlShape` (the helper relies on `mvf.*` keys present in `@gooddata/sdk-ui` bundles).
 * @param conditions - the measure value filter conditions; empty/undefined yields the "All" label.
 * @param options - formatting options ({@link IMeasureValueFilterConditionLabelOptions}).
 *
 * @internal
 */
export function getMeasureValueFilterConditionLabel(
    intl: IntlShape,
    conditions: MeasureValueFilterCondition[] | undefined,
    options: IMeasureValueFilterConditionLabelOptions = {},
): string {
    const allLabel = intl.formatMessage(messages.all);
    if (!conditions || conditions.length === 0) {
        return allLabel;
    }
    const { usePercentage = false, separators } = options;

    // Group consecutive same-operator conditions: first occurrence keeps the full label
    // (e.g. "> 100"), subsequent ones use value-only ("200"). Groups appear in the order of
    // their first occurrence — matching AD's `DropdownButtonValue` behavior.
    const groups = new Map<string, IConditionLabelParts[]>();
    const groupOrder: string[] = [];
    for (const condition of conditions) {
        const parts = buildConditionLabelParts(intl, condition, usePercentage, separators);
        if (!parts) {
            continue;
        }
        const existing = groups.get(parts.operatorKey);
        if (existing) {
            existing.push(parts);
        } else {
            groups.set(parts.operatorKey, [parts]);
            groupOrder.push(parts.operatorKey);
        }
    }

    if (groupOrder.length === 0) {
        return allLabel;
    }

    const resultParts: string[] = [];
    for (const key of groupOrder) {
        const group = groups.get(key)!;
        resultParts.push(group[0].fullLabel);
        for (const item of group.slice(1)) {
            resultParts.push(item.valueLabel);
        }
    }

    if (resultParts.length === 1) {
        return resultParts[0];
    }
    const joiner = ` ${intl.formatMessage(messages.or)} `;
    return resultParts.join(joiner);
}
