// (C) 2026 GoodData Corporation

import { type DateFilterGranularity } from "../dateFilterConfig/index.js";
import { type ComparisonConditionOperator, type RangeConditionOperator } from "../execution/filter/index.js";

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
 * Substring operators specific to conditional formatting. No existing SDK enum covers text
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
    | "NOT_ENDS_WITH";

/**
 * Emptiness operators — target-agnostic: an empty cell (null measure value, valueless attribute
 * element) is matched only by these, on any target kind.
 *
 * @alpha
 */
export type ConditionalFormattingEmptinessOperator = "IS_EMPTY" | "IS_NOT_EMPTY";

/**
 * Every operator a stored condition may carry. One shared, shape-grouped vocabulary: numeric and
 * range operators reuse the SDK measure-value-filter enums (`ComparisonConditionOperator`,
 * `RangeConditionOperator` from `@gooddata/sdk-model`); `"ALL"` always matches non-empty cells;
 * substring operators are {@link ConditionalFormattingTextOperator}; emptiness operators are
 * {@link ConditionalFormattingEmptinessOperator}. Which subset a target kind AUTHORS is editor
 * policy (see `operatorsForTarget` in sdk-ui-ext); the evaluation engine accepts any combination
 * and treats inapplicable ones as never matching.
 *
 * @alpha
 */
export type ConditionalFormattingOperator =
    | "ALL"
    | ComparisonConditionOperator
    | RangeConditionOperator
    | ConditionalFormattingTextOperator
    | ConditionalFormattingEmptinessOperator;

/**
 * The operand a condition compares against. Discriminated so range / no-operand / date / (future
 * column-reference) shapes stay valid by construction.
 *
 * Date values target date attributes and express a period; a single date is a period whose bounds
 * coincide. "Is on" (EQUAL_TO) means the cell's period lies within the value period; "Is after"
 * (GREATER_THAN) means after the period ends; "Is before" (LESS_THAN) before it starts.
 *
 * @alpha
 */
export type ConditionalFormattingValue =
    | { kind: "none" }
    | { kind: "literal"; value: string | number }
    | { kind: "literalRange"; from: number; to: number }
    | {
          kind: "absoluteDate";
          /**
           * Period start as a platform date string: "YYYY-MM-DD", or "YYYY-MM-DD HH:mm" for
           * hour/minute-granularity targets. Snapped to the period start at save time.
           */
          from: string;
          /**
           * Inclusive period end — the last day (or minute) of the period, mirroring how absolute
           * date filters store their `to` bound.
           */
          to: string;
      }
    | {
          kind: "relativeDate";
          /**
           * Granularity the offsets count in (linear granularities only).
           */
          granularity: DateFilterGranularity;
          /**
           * Integer period offset of the range start; 0 = the period containing the anchor,
           * negative = past, positive = future.
           */
          from: number;
          /**
           * Integer period offset of the range end (inclusive), \>= `from`.
           */
          to: number;
      };

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
    /**
     * Targets for which these insight-level rules take over entirely from any semantic-layer
     * conditional formatting carried on the execution result (see {@link ISemanticConditionalFormatting}).
     * A target listed here is Custom: its semantic rules are ignored, never merged. A target not
     * listed here (or when this is absent) is Inherited: semantic rules apply as-is.
     */
    customTargets?: readonly ConditionalFormattingTarget[];
}

/**
 * Conditional-formatting rules authored once on a semantic-layer catalog object (label, metric,
 * fact, or date dataset) and carried on the matching execution result header
 * (`attributeHeader.conditionalFormatting` / `measureHeaderItem.conditionalFormatting`) so every
 * insight built on that object inherits them without re-authoring. Unlike {@link IConditionalFormatting},
 * there is no per-rule target — the target is implicit (the header the rules arrived on) and there
 * is no on/off toggle or rule grouping, only a flat, first-match-wins condition list.
 *
 * @alpha
 */
export interface ISemanticConditionalFormatting {
    /**
     * Model version of the persisted shape. Absent is treated as `"1"`.
     */
    version?: string;
    conditions: readonly IConditionalFormattingCondition[];
}
