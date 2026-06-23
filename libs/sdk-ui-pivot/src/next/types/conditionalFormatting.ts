// (C) 2026 GoodData Corporation

import { type ComparisonConditionOperator, type RangeConditionOperator } from "@gooddata/sdk-model";

/**
 * Identifies the measure or attribute a conditional-formatting rule targets. Layout-neutral on
 * purpose: the same target applies whether the item renders as a column or — when transposed — as a
 * row, so the rule survives a transpose without re-pointing.
 *
 * @alpha
 */
export type ConditionalFormattingTarget =
    | { kind: "attribute"; attributeIdentifier: string }
    | { kind: "measure"; measureIdentifier: string };

/**
 * Text and empty operators specific to conditional formatting. No existing SDK enum covers text
 * matching (attribute filters are element-based IN/NOT_IN), so these are CF-specific.
 *
 * @alpha
 */
export type ConditionalFormattingTextOperator =
    | "CONTAINS"
    | "NOT_CONTAINS"
    | "STARTS_WITH"
    | "NOT_STARTS_WITH"
    | "ENDS_WITH"
    | "NOT_ENDS_WITH"
    | "IS_EMPTY"
    | "IS_NOT_EMPTY";

/**
 * Every operator a condition may use. Numeric and range operators reuse the SDK
 * measure-value-filter vocabulary (`ComparisonConditionOperator`, `RangeConditionOperator` from
 * `@gooddata/sdk-model`); `"ALL"` always matches; text/empty operators are
 * {@link ConditionalFormattingTextOperator}.
 *
 * @alpha
 */
export type ConditionalFormattingOperator =
    | "ALL"
    | ComparisonConditionOperator
    | RangeConditionOperator
    | ConditionalFormattingTextOperator;

/**
 * The operand a condition compares against. Discriminated so range / no-operand / (future
 * column-reference) shapes stay valid by construction.
 *
 * @alpha
 */
export type ConditionalFormattingValue =
    | { kind: "none" }
    | { kind: "literal"; value: string | number }
    | { kind: "literalRange"; from: number; to: number };

/**
 * The visual format applied to a matched cell or row.
 *
 * @alpha
 */
export interface IConditionalFormattingFormat {
    /**
     * Text color (raw hex, e.g. "#FFFFFF").
     */
    color?: string;
    /**
     * Fill / background color (raw hex, e.g. "#E54D40").
     */
    backgroundColor?: string;
    /**
     * Whether the format applies to the matched cell only or the whole row.
     */
    scope: "cell" | "row";
}

/**
 * A single condition: an operator + operand, and the format applied when it matches.
 *
 * @alpha
 */
export interface IConditionalFormattingCondition {
    id: string;
    operator: ConditionalFormattingOperator;
    value: ConditionalFormattingValue;
    format: IConditionalFormattingFormat;
}

/**
 * A rule targeting one measure or attribute with one or more stacked conditions. The first matching
 * condition (top-down) wins.
 *
 * @alpha
 */
export interface IConditionalFormattingRule {
    id: string;
    target: ConditionalFormattingTarget;
    conditions: readonly IConditionalFormattingCondition[];
}

/**
 * Conditional-formatting settings: an on/off toggle plus the ordered list of rules. Stored on the
 * table config and (when persisted) on the insight's `properties.controls.conditionalFormatting`.
 *
 * @alpha
 */
export interface IConditionalFormatting {
    /**
     * Model version of the persisted shape (mirrors the dashboard model-version convention). Absent
     * is treated as `"1"`. Lets the persisted contract evolve for cross-stack readers (e.g. server
     * XLSX export) without breaking older saved insights.
     */
    version?: string;
    enabled: boolean;
    rules: readonly IConditionalFormattingRule[];
}

/**
 * Resolved trigger columns, aligned by index to {@link IConditionalFormatting.rules}: each rule maps
 * to the colIds of every column that may hold its target's value. One colId for a non-pivoted target,
 * several for a pivoted measure (one per pivot group), the shared value column for a transposed
 * measure, and `[]` when the target is absent from the current layout. Computed once per render.
 *
 * @internal
 */
export type ConditionalFormattingTriggerColIds = readonly (readonly string[])[];

/**
 * Config slot intersected into {@link PivotTableNextConfig} so conditional formatting can be passed
 * through the `config` prop (and read back from insight properties).
 *
 * @alpha
 */
export type PivotTableNextConditionalFormattingConfig = {
    /**
     * Rules that color cells/rows based on their values. Absent = no conditional formatting.
     */
    conditionalFormatting?: IConditionalFormatting;
};
