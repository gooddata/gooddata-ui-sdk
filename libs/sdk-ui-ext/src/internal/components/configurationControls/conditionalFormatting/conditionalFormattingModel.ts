// (C) 2026 GoodData Corporation

import { v4 as uuid } from "uuid";

import {
    type IInsightDefinition,
    attributeAlias,
    attributeLocalId,
    bucketAttributes,
    insightBucket,
    insightMeasures,
    isResultAttributeHeader,
    measureAlias,
    measureDoesComputeRatio,
    measureFormat,
    measureLocalId,
    measureTitle,
    resultHeaderName,
} from "@gooddata/sdk-model";
import { BucketNames, type DataViewFacade } from "@gooddata/sdk-ui";
import {
    type ConditionalFormattingOperator,
    type ConditionalFormattingTarget,
    type ConditionalFormattingValue,
    type IConditionalFormattingCondition,
    type IConditionalFormattingRule,
} from "@gooddata/sdk-ui-pivot/next";

import { CF_DEFAULT_COLOR } from "./conditionalFormattingColors.js";

/** A selectable measure/attribute for the rule's "applies to" dropdown. */
export interface ITargetOption {
    /** `measure:<localId>` | `attribute:<localId>` */
    value: string;
    title: string;
    target: ConditionalFormattingTarget;
    /** Percent-formatted measure: the value input edits display units (40), the rule stores raw (0.4). */
    isPercent?: boolean;
    /** Element suggestions from the current (paged) result — a convenience over free text, never a constraint. */
    elements?: readonly string[];
}

// Cap suggestions so a high-cardinality attribute can't build a huge suggestion list.
const MAX_ELEMENT_SUGGESTIONS = 200;

const targetToValue = (target: ConditionalFormattingTarget): string =>
    target.kind === "measure"
        ? `measure:${target.measureIdentifier}`
        : `attribute:${target.attributeIdentifier}`;

/** Execution-resolved data the CF UI needs per localId; flows as one object from the pluggable down. */
export interface ICfTargetData {
    /** Data-view titles by localId; preferred over the insight's often-absent titles. Empty until first load. */
    titles?: Record<string, string>;
    /** Data-view formats by localId; a lagging fallback — insight-derivable info wins. */
    formats?: Record<string, string>;
    /** Distinct attribute element values by localId; drives value autocomplete. */
    elements?: Record<string, string[]>;
}

/**
 * Extracts {@link ICfTargetData} from the executed data view. Titles must come from here — attribute
 * titles live only on the result headers, and measures resolve to their final header name; formats
 * living on metric metadata also resolve only here (insight-level formats win in buildTargetOptions).
 */
export function buildCfTargetData(dataView: DataViewFacade): Required<ICfTargetData> {
    const titles: Record<string, string> = {};
    const formats: Record<string, string> = {};
    for (const measure of dataView.meta().measureDescriptors()) {
        const { localIdentifier, name, format } = measure.measureHeaderItem;
        titles[localIdentifier] = name;
        if (format) {
            formats[localIdentifier] = format;
        }
    }
    for (const attribute of dataView.meta().attributeDescriptors()) {
        titles[attribute.attributeHeader.localIdentifier] = attribute.attributeHeader.formOf.name;
    }
    return { titles, formats, elements: buildElementsByLocalId(dataView) };
}

// Attribute header groups align by index with the dimension's attribute descriptors; the collected
// elements are only as complete as the loaded (paged) result.
function buildElementsByLocalId(dataView: DataViewFacade): Record<string, string[]> {
    const elements: Record<string, string[]> = {};
    const meta = dataView.meta();
    meta.dimensions().forEach((_dimension, dimIndex) => {
        const descriptors = meta.attributeDescriptorsForDim(dimIndex);
        const headerGroups = meta.attributeHeadersForDim(dimIndex);
        descriptors.forEach((descriptor, index) => {
            const localId = descriptor.attributeHeader.localIdentifier;
            const seen = new Set<string>();
            for (const header of headerGroups[index] ?? []) {
                if (seen.size >= MAX_ELEMENT_SUGGESTIONS) {
                    break;
                }
                // attributeHeadersForDim's type is optimistic — it filters groups by their FIRST
                // header only, so with (sub)totals on, total headers ("sum") ride along in the group.
                if (!isResultAttributeHeader(header)) {
                    continue;
                }
                const name = resultHeaderName(header);
                if (name) {
                    seen.add(name);
                }
            }
            elements[localId] = [...seen];
        });
    });
    return elements;
}

export function buildTargetOptions(insight: IInsightDefinition, data: ICfTargetData = {}): ITargetOption[] {
    const { titles = {}, formats = {}, elements = {} } = data;
    const measures = insightMeasures(insight).map((measure): ITargetOption => {
        const localId = measureLocalId(measure);
        const target: ConditionalFormattingTarget = { kind: "measure", measureIdentifier: localId };
        const insightFormat = measureFormat(measure);
        return {
            value: targetToValue(target),
            title: titles[localId] ?? measureTitle(measure) ?? measureAlias(measure) ?? localId,
            target,
            // fillMissingFormat's precedence: an explicit insight format (reacts to edits instantly,
            // never stale), then show-in-% (percent by definition), then the execution fallback.
            isPercent: insightFormat
                ? isPercentFormat(insightFormat)
                : measureDoesComputeRatio(measure) || isPercentFormat(formats[localId]),
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
            elements: elements[localId],
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

export type ConditionValueEditor = "none" | "number" | "combobox" | "text" | "range";

const isEqualityOperator = (operator: ConditionalFormattingOperator): boolean =>
    operator === "EQUAL_TO" || operator === "NOT_EQUAL_TO";

/**
 * Which editor a condition's value renders with. Element suggestions apply only to attribute
 * Is / Is not (per design) — substring operators keep the plain text input.
 */
export const valueEditorKind = (
    condition: IConditionalFormattingCondition,
    kind: ConditionalFormattingTarget["kind"],
    hasSuggestions: boolean,
): ConditionValueEditor => {
    switch (operatorArity(condition.operator)) {
        case "none":
            return "none";
        case "range":
            return "range";
        case "single":
            if (kind === "measure") {
                return "number";
            }
            return hasSuggestions && isEqualityOperator(condition.operator) ? "combobox" : "text";
    }
};

// --- Factories -------------------------------------------------------------------------------

/** Fresh empty operand of the right shape for the operator. */
export const emptyValueForOperator = (
    operator: ConditionalFormattingOperator,
): ConditionalFormattingValue => {
    switch (operatorArity(operator)) {
        case "none":
            return { kind: "none" };
        case "range":
            // NaN = a bound not yet entered (rendered blank). isRuleComplete blocks Save until both
            // bounds are finite, so NaN stays dialog-local and never persists (it would
            // JSON-serialize to null); the contract type can stay a tight `{ from: number; to: number }`.
            return { kind: "literalRange", from: NaN, to: NaN };
        case "single":
            return { kind: "literal", value: "" };
    }
};

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

/**
 * Rule re-pointed at a new target. Crossing target kinds invalidates the operators, so conditions
 * reset; crossing the percent boundary within measures changes the value units out from under the
 * user, so operators stay but values clear (Save disables until re-entered).
 */
export const ruleWithTarget = (
    rule: IConditionalFormattingRule,
    next: ITargetOption,
    previous: ITargetOption | undefined,
): IConditionalFormattingRule => {
    if (next.target.kind !== rule.target.kind) {
        return { ...rule, target: next.target, conditions: [newCondition()] };
    }
    if ((next.isPercent ?? false) !== (previous?.isPercent ?? false)) {
        return {
            ...rule,
            target: next.target,
            conditions: rule.conditions.map((condition) => ({
                ...condition,
                value: emptyValueForOperator(condition.operator),
            })),
        };
    }
    return { ...rule, target: next.target };
};

// --- Percent-aware value input ---------------------------------------------------------------

/**
 * Percent = the format contains a `%` outside quoted/escaped literals (those render a % sign without
 * percent scaling). A heuristic by design: it only picks the authoring input's display units; the
 * contract compares the raw value either way. Scaled formats are out of scope.
 */
export const isPercentFormat = (format: string | undefined): boolean =>
    typeof format === "string" &&
    format
        .replace(/"[^"]*"/g, "")
        .replace(/\\./g, "")
        .includes("%");

// 0.4 * 100 = 40.00000000000001 in IEEE-754; toPrecision(12) drops the tail.
const denoise = (n: number): number => Number(n.toPrecision(12));

/** Raw stored number -> the number the user sees in a percent input (×100). */
export const rawToDisplayNumber = (raw: number, percent: boolean): number =>
    percent ? denoise(raw * 100) : raw;

/** Number entered in a percent input -> the raw number stored and compared (÷100). */
export const displayToRawNumber = (display: number, percent: boolean): number =>
    percent ? denoise(display / 100) : display;

// --- Validation ------------------------------------------------------------------------------

export type ConditionalFormattingFieldError = "rangeOrder";

export interface IConditionErrors {
    range?: ConditionalFormattingFieldError;
}

const isBlank = (value: string | number): boolean => String(value).trim() === "";

/**
 * A non-numeric measure literal can only come from stored data (the number input cannot produce one)
 * and would render as an invisible value; coerce it to the empty sentinel the UI can actually show —
 * the disabled Save button then covers it like any other missing value.
 */
export const sanitizeRuleForEditing = (rule: IConditionalFormattingRule): IConditionalFormattingRule => {
    if (rule.target.kind !== "measure") {
        return rule;
    }
    return {
        ...rule,
        conditions: rule.conditions.map((condition) =>
            condition.value.kind === "literal" &&
            !isBlank(condition.value.value) &&
            Number.isNaN(Number(condition.value.value))
                ? { ...condition, value: { kind: "literal", value: "" } }
                : condition,
        ),
    };
};

export interface IConditionValidation {
    /** A required operand is absent — gates Save, never shown as an error. */
    missing: boolean;
    /** Present-but-invalid input — surfaced inline by the editor (and also gates Save). */
    errors: IConditionErrors;
}

/**
 * Single source for both validation surfaces, making "empty is incomplete, not invalid" structural:
 * {@link isRuleComplete} derives from the whole result, the editor renders only `errors`.
 */
export const validateCondition = (
    condition: IConditionalFormattingCondition,
    kind: ConditionalFormattingTarget["kind"],
): IConditionValidation => {
    const { value } = condition;
    switch (operatorArity(condition.operator)) {
        case "none":
            return { missing: false, errors: {} };
        case "range": {
            if (value.kind !== "literalRange") {
                return { missing: true, errors: {} };
            }
            const missing = !Number.isFinite(value.from) || !Number.isFinite(value.to);
            return { missing, errors: !missing && value.from > value.to ? { range: "rangeOrder" } : {} };
        }
        case "single":
            if (value.kind !== "literal") {
                return { missing: true, errors: {} };
            }
            // Guard the empty string first: `Number("") === 0` (not NaN), which would otherwise let an
            // empty measure threshold pass as a valid 0.
            return {
                missing: isBlank(value.value) || (kind === "measure" && Number.isNaN(Number(value.value))),
                errors: {},
            };
    }
};

/** A rule is saveable when every condition has a valid operand for its operator. */
export const isRuleComplete = (rule: IConditionalFormattingRule): boolean =>
    rule.conditions.length > 0 &&
    rule.conditions.every((condition) => {
        const { missing, errors } = validateCondition(condition, rule.target.kind);
        return !missing && Object.keys(errors).length === 0;
    });
