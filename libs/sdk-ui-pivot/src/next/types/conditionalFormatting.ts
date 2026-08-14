// (C) 2026 GoodData Corporation

/* oxlint-disable no-barrel-files/no-barrel-files -- re-export shim, types moved to @gooddata/sdk-model */

import type {
    ConditionalFormattingEmptinessOperator,
    ConditionalFormattingOperator,
    ConditionalFormattingTarget,
    ConditionalFormattingTextOperator,
    ConditionalFormattingValue,
    IConditionalFormatting,
    IConditionalFormattingCondition,
    IConditionalFormattingFormat,
    IConditionalFormattingRule,
} from "@gooddata/sdk-model";

import { type PivotTableNextConfig } from "./public.js";

export type {
    ConditionalFormattingEmptinessOperator,
    ConditionalFormattingOperator,
    ConditionalFormattingTarget,
    ConditionalFormattingTextOperator,
    ConditionalFormattingValue,
    IConditionalFormatting,
    IConditionalFormattingCondition,
    IConditionalFormattingFormat,
    IConditionalFormattingRule,
};

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
 * Label-space bounds of one resolved date condition: the first and last wire label (at the target
 * column's granularity) of the value period. Labels are fixed-width and zero-padded, so containment
 * and ordering reduce to plain string comparison.
 *
 * @internal
 */
export interface IDateConditionBounds {
    fromLabel: string;
    toLabel: string;
}

/**
 * Resolved date bounds keyed by `<ruleIndex>:<conditionId>` (ids in hand-authored config are only
 * trustworthy within a rule; position is collision-proof) — computed once per render alongside
 * trigger resolution. `null` marks an unresolvable condition (malformed value, fiscal or unknown
 * granularity, non-date target): it never matches. Conditions without a date value are absent.
 *
 * @internal
 */
export type ConditionalFormattingDateBounds = Record<string, IDateConditionBounds | null>;

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
    /**
     * Whether the engine may inherit conditional formatting from semantic-layer catalog objects
     * (carried on execution result headers). Defaults to `false` — `conditionalFormatting` being
     * absent/disabled is not enough to keep inheritance off, since it's resolved independently
     * from descriptors the host can't otherwise suppress. Off by default so every consumer ships
     * dark until it explicitly opts in.
     */
    enableSemanticConditionalFormatting?: boolean;
};

/**
 * {@link PivotTableNextConfig} extended with the conditional formatting configuration.
 *
 * @remarks
 * Exists because `PivotTableNextConfig` (`@public`) must not reference this `@alpha` config
 * directly (api-extractor release-tag rule). Once conditional formatting graduates to `@public`,
 * fold the config in there and keep this alias as a deprecated re-export — that preserves the
 * type name only, so a change to the conditional formatting model still forces anyone holding
 * generated embed code to regenerate it.
 *
 * @alpha
 */
export type PivotTableNextConfigWithConditionalFormatting = PivotTableNextConfig &
    PivotTableNextConditionalFormattingConfig;
