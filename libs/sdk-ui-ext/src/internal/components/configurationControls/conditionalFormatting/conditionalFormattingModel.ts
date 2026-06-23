// (C) 2026 GoodData Corporation

import { v4 as uuid } from "uuid";

import {
    type IInsightDefinition,
    attributeAlias,
    attributeLocalId,
    bucketAttributes,
    insightBucket,
    insightMeasures,
    measureAlias,
    measureLocalId,
    measureTitle,
} from "@gooddata/sdk-model";
import { BucketNames, type DataViewFacade } from "@gooddata/sdk-ui";
import {
    type ConditionalFormattingOperator,
    type ConditionalFormattingTarget,
    type IConditionalFormattingCondition,
    type IConditionalFormattingRule,
} from "@gooddata/sdk-ui-pivot/next";

import { CF_DEFAULT_COLOR } from "./conditionalFormattingColors.js";

/** A selectable measure/attribute for the rule's "applies to" dropdown. */
export interface ITargetOption {
    value: string; // "measure:<localId>" | "attribute:<localId>"
    title: string;
    target: ConditionalFormattingTarget;
}

const targetToValue = (target: ConditionalFormattingTarget): string =>
    target.kind === "measure"
        ? `measure:${target.measureIdentifier}`
        : `attribute:${target.attributeIdentifier}`;

/**
 * Builds a `localIdentifier -> display title` map from the executed data view. Attribute titles live
 * only on the result headers (not on the insight/buckets), so this is the only reliable source for
 * human attribute names; measures also resolve to their final header name here.
 */
export function buildTitlesByLocalId(dataView: DataViewFacade): Record<string, string> {
    const titles: Record<string, string> = {};
    for (const measure of dataView.meta().measureDescriptors()) {
        titles[measure.measureHeaderItem.localIdentifier] = measure.measureHeaderItem.name;
    }
    for (const attribute of dataView.meta().attributeDescriptors()) {
        titles[attribute.attributeHeader.localIdentifier] = attribute.attributeHeader.formOf.name;
    }
    return titles;
}

export function buildTargetOptions(
    insight: IInsightDefinition,
    // Resolved data-view titles keyed by localIdentifier; preferred over the insight's own (often
    // absent) titles/aliases. Empty until the first data view arrives.
    titles: Record<string, string> = {},
): ITargetOption[] {
    const measures = insightMeasures(insight).map((measure): ITargetOption => {
        const localId = measureLocalId(measure);
        const target: ConditionalFormattingTarget = { kind: "measure", measureIdentifier: localId };
        return {
            value: targetToValue(target),
            title: titles[localId] ?? measureTitle(measure) ?? measureAlias(measure) ?? localId,
            target,
        };
    });
    // Only ROW attributes are offerable: a rule formats a row/cell by the row's value, and a row
    // attribute has a per-row element. Column attributes define columns (no per-row value), so they
    // can't be honored here — we don't list what we can't apply. (Column highlighting would be its
    // own feature.) Falls back to none when the rows bucket is absent.
    const rowsBucket = insightBucket(insight, BucketNames.ATTRIBUTE);
    const rowAttributes = rowsBucket ? bucketAttributes(rowsBucket) : [];
    const attributes = rowAttributes.map((attribute): ITargetOption => {
        const localId = attributeLocalId(attribute);
        const target: ConditionalFormattingTarget = { kind: "attribute", attributeIdentifier: localId };
        return {
            value: targetToValue(target),
            title: titles[localId] ?? attributeAlias(attribute) ?? localId,
            target,
        };
    });
    return [...measures, ...attributes];
}

export const findTargetOption = (
    options: ITargetOption[],
    target: ConditionalFormattingTarget,
): ITargetOption | undefined => options.find((option) => option.value === targetToValue(target));

export const targetLocalId = (target: ConditionalFormattingTarget): string =>
    target.kind === "measure" ? target.measureIdentifier : target.attributeIdentifier;

// --- Operators -------------------------------------------------------------------------------

const NO_VALUE_OPERATORS: ReadonlySet<ConditionalFormattingOperator> = new Set([
    "ALL",
    "IS_EMPTY",
    "IS_NOT_EMPTY",
]);

const RANGE_OPERATORS: ReadonlySet<ConditionalFormattingOperator> = new Set(["BETWEEN", "NOT_BETWEEN"]);

const MEASURE_OPERATORS: ConditionalFormattingOperator[] = [
    "ALL",
    "EQUAL_TO",
    "NOT_EQUAL_TO",
    "GREATER_THAN",
    "GREATER_THAN_OR_EQUAL_TO",
    "LESS_THAN",
    "LESS_THAN_OR_EQUAL_TO",
    "BETWEEN",
    "NOT_BETWEEN",
    "IS_EMPTY",
    "IS_NOT_EMPTY",
];

const ATTRIBUTE_OPERATORS: ConditionalFormattingOperator[] = [
    "ALL",
    "EQUAL_TO",
    "NOT_EQUAL_TO",
    "CONTAINS",
    "NOT_CONTAINS",
    "STARTS_WITH",
    "NOT_STARTS_WITH",
    "ENDS_WITH",
    "NOT_ENDS_WITH",
    "IS_EMPTY",
    "IS_NOT_EMPTY",
];

export const operatorsForKind = (
    kind: ConditionalFormattingTarget["kind"],
): ConditionalFormattingOperator[] => (kind === "measure" ? MEASURE_OPERATORS : ATTRIBUTE_OPERATORS);

// Shared operator glyphs from sdk-ui-kit (same icons the measure-value-filter uses). Numeric/common
// operators have icons; text and empty operators render label-only (matching the attribute filter).
const OPERATOR_ICON_NAMES: Partial<Record<ConditionalFormattingOperator, string>> = {
    ALL: "all",
    GREATER_THAN: "greater-than",
    GREATER_THAN_OR_EQUAL_TO: "greater-than-equal-to",
    LESS_THAN: "less-than",
    LESS_THAN_OR_EQUAL_TO: "less-than-equal-to",
    EQUAL_TO: "equal-to",
    NOT_EQUAL_TO: "not-equal-to",
    BETWEEN: "between",
    NOT_BETWEEN: "not-between",
};

export const operatorIcon = (operator: ConditionalFormattingOperator): string | undefined => {
    const name = OPERATOR_ICON_NAMES[operator];
    return name ? `gd-icon-${name}` : undefined;
};

// Type icon distinguishing attribute (ABC) from measure (metric) targets — same icons AD uses
// elsewhere for catalog/bucket items.
export const targetIcon = (kind: ConditionalFormattingTarget["kind"]): string =>
    kind === "attribute" ? "gd-icon-attribute" : "gd-icon-metric";

export type OperatorArity = "none" | "single" | "range";

export const operatorArity = (operator: ConditionalFormattingOperator): OperatorArity => {
    if (NO_VALUE_OPERATORS.has(operator)) {
        return "none";
    }
    return RANGE_OPERATORS.has(operator) ? "range" : "single";
};

// --- Factories -------------------------------------------------------------------------------

export const newCondition = (): IConditionalFormattingCondition => ({
    id: uuid(),
    operator: "ALL",
    value: { kind: "none" },
    // Default: colored text on a transparent background (no fill).
    format: { color: CF_DEFAULT_COLOR, scope: "cell" },
});

export const newRule = (target: ConditionalFormattingTarget): IConditionalFormattingRule => ({
    id: uuid(),
    target,
    conditions: [newCondition()],
});

// --- Validation ------------------------------------------------------------------------------

const isConditionComplete = (
    condition: IConditionalFormattingCondition,
    kind: ConditionalFormattingTarget["kind"],
): boolean => {
    const { value } = condition;
    switch (operatorArity(condition.operator)) {
        case "none":
            return true;
        case "range":
            return value.kind === "literalRange" && Number.isFinite(value.from) && Number.isFinite(value.to);
        case "single":
            if (value.kind !== "literal") {
                return false;
            }
            // Guard the empty string first: `Number("") === 0` (not NaN), which would otherwise let an
            // empty measure threshold pass as a valid 0.
            return (
                String(value.value).trim() !== "" &&
                (kind === "attribute" || !Number.isNaN(Number(value.value)))
            );
    }
};

/** A rule is saveable when every condition has the operand its operator requires. */
export const isRuleComplete = (rule: IConditionalFormattingRule): boolean =>
    rule.conditions.length > 0 &&
    rule.conditions.every((condition) => isConditionComplete(condition, rule.target.kind));
