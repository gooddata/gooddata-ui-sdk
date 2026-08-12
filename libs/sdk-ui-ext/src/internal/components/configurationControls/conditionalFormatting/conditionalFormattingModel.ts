// (C) 2026 GoodData Corporation

import { v4 as uuid } from "uuid";

import {
    type DateFilterGranularity,
    type IInsightDefinition,
    type WeekStart,
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
    isDateConditionValue,
    normalizeDateConditionGranularity,
    resolveDateConditionBounds,
} from "@gooddata/sdk-ui-pivot/next";

import { CF_DEFAULT_COLOR } from "./conditionalFormattingColors.js";

/**
 * Date-attribute metadata date conditions author and validate against. Present only for granularities
 * the evaluation engine supports (linear; fiscal joins once its labeling convention is verified).
 */
export interface ICfDateMeta {
    granularity: DateFilterGranularity;
    /** The column's timezone (descriptor `format.timezone`) — "today" resolves in it. */
    timezone?: string;
}

/** Workspace date-display settings the date value picker honors (derived by the host from settings). */
export interface ICfDateSettings {
    dateFormat?: string;
    weekStart?: WeekStart;
}

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
    /** Present iff the attribute is a date-condition-eligible date attribute; switches the condition set. */
    date?: ICfDateMeta;
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
    /** Date metadata by localId for date-condition-eligible attributes (descriptor granularity/timezone). */
    dates?: Record<string, ICfDateMeta>;
}

/**
 * Extracts {@link ICfTargetData} from the executed data view. Titles must come from here — attribute
 * titles live only on the result headers, and measures resolve to their final header name; formats
 * living on metric metadata also resolve only here (insight-level formats win in buildTargetOptions).
 */
export function buildCfTargetData(dataView: DataViewFacade): Required<ICfTargetData> {
    const titles: Record<string, string> = {};
    const formats: Record<string, string> = {};
    const dates: Record<string, ICfDateMeta> = {};
    for (const measure of dataView.meta().measureDescriptors()) {
        const { localIdentifier, name, format } = measure.measureHeaderItem;
        titles[localIdentifier] = name;
        if (format) {
            formats[localIdentifier] = format;
        }
    }
    for (const attribute of dataView.meta().attributeDescriptors()) {
        const { localIdentifier, formOf, granularity, format } = attribute.attributeHeader;
        titles[localIdentifier] = formOf.name;
        // Eligible date attributes (resolvable granularity) get date conditions; the rest keep plain text.
        const normalizedGranularity = normalizeDateConditionGranularity(granularity);
        if (normalizedGranularity) {
            dates[localIdentifier] = {
                granularity: normalizedGranularity,
                ...(format?.timezone ? { timezone: format.timezone } : {}),
            };
        }
    }
    return { titles, formats, elements: buildElementsByLocalId(dataView), dates };
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
    const { titles = {}, formats = {}, elements = {}, dates = {} } = data;
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
            date: dates[localId],
        };
    });
    return [...measures, ...attributes];
}

export const findTargetOption = (
    options: ITargetOption[],
    target: ConditionalFormattingTarget,
): ITargetOption | undefined => options.find((option) => option.value === targetToValue(target));

/** Date-eligible target: the option carries execution-resolved date metadata. */
export const isDateTarget = (option: ITargetOption | undefined): boolean => option?.date !== undefined;

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

// Same operator constants as measures, date-specific labels. The inclusive pair (on-or-after/before)
// avoids the "Is after yesterday" off-by-one; no IS_NOT_EMPTY — on a date column it equals All time.
const DATE_OPERATORS: ConditionalFormattingOperator[] = [
    "ALL",
    "EQUAL_TO",
    "NOT_EQUAL_TO",
    "GREATER_THAN",
    "GREATER_THAN_OR_EQUAL_TO",
    "LESS_THAN",
    "LESS_THAN_OR_EQUAL_TO",
    "IS_EMPTY",
];

const DATE_OPERATOR_SET: ReadonlySet<ConditionalFormattingOperator> = new Set(DATE_OPERATORS);

export const operatorsForTarget = (
    kind: ConditionalFormattingTarget["kind"],
    isDate: boolean,
): ConditionalFormattingOperator[] => {
    if (kind === "measure") {
        return MEASURE_OPERATORS;
    }
    return isDate ? DATE_OPERATORS : ATTRIBUTE_OPERATORS;
};

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

// Type icon distinguishing attribute (ABC), date (calendar), and measure (metric) targets — same
// icons AD uses elsewhere for catalog/bucket items.
export const targetIcon = (kind: ConditionalFormattingTarget["kind"], isDate = false): string => {
    if (kind === "measure") {
        return "gd-icon-metric";
    }
    return isDate ? "gd-icon-date" : "gd-icon-attribute";
};

export type OperatorArity = "none" | "single" | "range";

export const operatorArity = (operator: ConditionalFormattingOperator): OperatorArity => {
    if (NO_VALUE_OPERATORS.has(operator)) {
        return "none";
    }
    return RANGE_OPERATORS.has(operator) ? "range" : "single";
};

export type ConditionValueEditor = "none" | "number" | "combobox" | "text" | "range" | "date";

const isEqualityOperator = (operator: ConditionalFormattingOperator): boolean =>
    operator === "EQUAL_TO" || operator === "NOT_EQUAL_TO";

/**
 * Which editor a condition's value renders with. Element suggestions apply only to attribute
 * Is / Is not (per design) — substring operators keep the plain text input. A date target's single
 * operand is always the period picker.
 */
export const valueEditorKind = (
    condition: IConditionalFormattingCondition,
    kind: ConditionalFormattingTarget["kind"],
    hasSuggestions: boolean,
    isDate: boolean,
): ConditionValueEditor => {
    switch (operatorArity(condition.operator)) {
        case "none":
            return "none";
        case "range":
            return "range";
        case "single":
            if (isDate) {
                return "date";
            }
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
    isDate = false,
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
            // A date operand starts unpicked ("none"); validation treats it as missing until picked.
            return isDate ? { kind: "none" } : { kind: "literal", value: "" };
    }
};

/**
 * An entered operand survives operator changes within the same shape (e.g. \> to \>=); a picked date
 * period likewise survives switching among the single-operand date operators (Is on ↔ Is after…).
 */
export const valueForOperator = (
    operator: ConditionalFormattingOperator,
    previous: ConditionalFormattingValue,
    isDate: boolean,
): ConditionalFormattingValue => {
    const empty = emptyValueForOperator(operator, isDate);
    // Single-operand only — no-operand operators (ALL, IS_EMPTY) must not retain a hidden period.
    if (
        isDate &&
        empty.kind === "none" &&
        isDateConditionValue(previous) &&
        operatorArity(operator) === "single"
    ) {
        return previous;
    }
    return previous.kind === empty.kind ? previous : empty;
};

/** The text a free-text/combobox editor shows for a literal operand. */
export const literalText = (value: ConditionalFormattingValue): string =>
    value.kind === "literal" ? String(value.value) : "";

/** The finite number a numeric editor shows for a literal operand, or null (blank input). */
export const literalRaw = (value: ConditionalFormattingValue): number | null => {
    if (value.kind !== "literal" || String(value.value).trim() === "") {
        return null;
    }
    const n = Number(value.value);
    return Number.isFinite(n) ? n : null;
};

/** One finite bound of a range operand, or null (blank input). */
export const rangeRaw = (value: ConditionalFormattingValue, bound: "from" | "to"): number | null => {
    if (value.kind !== "literalRange") {
        return null;
    }
    const n = value[bound];
    return Number.isFinite(n) ? n : null;
};

// Date rules default to "Is on" with the period unpicked (per design); others to the catch-all.
const defaultOperator = (isDate: boolean): ConditionalFormattingOperator => (isDate ? "EQUAL_TO" : "ALL");

export const newCondition = (isDate = false): IConditionalFormattingCondition => ({
    id: uuid(),
    operator: defaultOperator(isDate),
    value: { kind: "none" },
    // Default: colored text on a transparent background (no fill).
    format: { color: CF_DEFAULT_COLOR, scope: "cell" },
});

export const newRule = (option: ITargetOption): IConditionalFormattingRule => ({
    id: uuid(),
    target: option.target,
    conditions: [newCondition(isDateTarget(option))],
});

/**
 * Rule re-pointed at a new target. Crossing target kinds — or the date/plain boundary within
 * attributes — coerces operators to the new family and clears values (per-condition color/scope
 * survive). Crossing the percent boundary, or a granularity change within dates, keeps operators
 * but clears values. Either way Save disables until re-entered.
 */
export const ruleWithTarget = (
    rule: IConditionalFormattingRule,
    next: ITargetOption,
    previous: ITargetOption | undefined,
): IConditionalFormattingRule => {
    const nextIsDate = isDateTarget(next);
    // `previous` is undefined when retargeting an invalid rule (target already left the insight);
    // sniff the rule's own values instead, so stale date values can't leak onto a non-date target.
    // Shapes the sniff can't classify (ALL/IS_EMPTY-only) are valid in both families anyway.
    const wasDate = previous
        ? isDateTarget(previous)
        : rule.conditions.some((condition) => isDateConditionValue(condition.value));
    if (next.target.kind !== rule.target.kind || nextIsDate !== wasDate) {
        const validOperators = new Set(operatorsForTarget(next.target.kind, nextIsDate));
        return {
            ...rule,
            target: next.target,
            // Explicit shape (no spread) so no future family-specific field rides across the boundary.
            conditions: rule.conditions.map((condition) => {
                const operator = validOperators.has(condition.operator)
                    ? condition.operator
                    : defaultOperator(nextIsDate);
                return {
                    id: condition.id,
                    operator,
                    value: emptyValueForOperator(operator, nextIsDate),
                    format: condition.format,
                };
            }),
        };
    }
    const granularityChanged = nextIsDate && next.date?.granularity !== previous?.date?.granularity;
    if (granularityChanged || (next.isPercent ?? false) !== (previous?.isPercent ?? false)) {
        return {
            ...rule,
            target: next.target,
            conditions: rule.conditions.map((condition) => ({
                ...condition,
                value: emptyValueForOperator(condition.operator, nextIsDate),
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

/** Present-but-invalid input, detected by {@link validateCondition}. */
export type ConditionInvalidError = "rangeOrder" | "dateUnresolvable";

/** Everything the editor renders inline: the model's errors plus its own blank-visited-field state. */
export type ConditionalFormattingFieldError = ConditionInvalidError | "valueEmpty";

const isBlank = (value: string | number): boolean => String(value).trim() === "";

/**
 * Coerces stored condition shapes the editor cannot represent so an AAC-authored rule opens editable
 * instead of dead-ended (disabled Save then covers the cleared values). A non-numeric measure literal
 * clears to empty; on a date target, operators/values outside the date set reset to an unpicked
 * "Is on" (id and format survive). The engine keeps evaluating the stored original until Save.
 */
export const sanitizeRuleForEditing = (
    rule: IConditionalFormattingRule,
    isDate = false,
): IConditionalFormattingRule => {
    if (rule.target.kind === "attribute" && isDate) {
        return {
            ...rule,
            conditions: rule.conditions.map((condition) => {
                const operatorOk = DATE_OPERATOR_SET.has(condition.operator);
                // A period is only a valid operand on single-operand operators.
                const valueOk =
                    condition.value.kind === "none" ||
                    (operatorArity(condition.operator) === "single" && isDateConditionValue(condition.value));
                if (operatorOk && valueOk) {
                    return condition;
                }
                return {
                    ...condition,
                    operator: operatorOk ? condition.operator : "EQUAL_TO",
                    value: { kind: "none" },
                };
            }),
        };
    }
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
    /** A required operand is absent — gates Save; the editor shows it only on a visited field. */
    missing: boolean;
    /** Present-but-invalid input — surfaced inline by the editor immediately (and also gates Save). */
    error?: ConditionInvalidError;
}

/**
 * Single source for both validation surfaces: {@link isRuleComplete} derives from the whole result,
 * while the editor renders `error` unconditionally and `missing` only once the field has been
 * visited (a value the user hasn't reached yet is incomplete, not wrong).
 */
export const validateCondition = (
    condition: IConditionalFormattingCondition,
    kind: ConditionalFormattingTarget["kind"],
    date?: ICfDateMeta,
): IConditionValidation => {
    const { value } = condition;
    switch (operatorArity(condition.operator)) {
        case "none":
            return { missing: false };
        case "range": {
            if (value.kind !== "literalRange") {
                return { missing: true };
            }
            const missing = !Number.isFinite(value.from) || !Number.isFinite(value.to);
            return !missing && value.from > value.to ? { missing, error: "rangeOrder" } : { missing };
        }
        case "single":
            if (date) {
                if (!isDateConditionValue(value)) {
                    return { missing: true };
                }
                // Unresolvable (malformed value, fiscal granularity) never matches — block Save.
                const resolvable =
                    resolveDateConditionBounds(value, date.granularity, date.timezone) !== null;
                return resolvable ? { missing: false } : { missing: false, error: "dateUnresolvable" };
            }
            if (value.kind !== "literal") {
                return { missing: true };
            }
            // Guard the empty string first: `Number("") === 0` (not NaN), which would otherwise let an
            // empty measure threshold pass as a valid 0.
            return {
                missing: isBlank(value.value) || (kind === "measure" && Number.isNaN(Number(value.value))),
            };
    }
};

/** A rule is saveable when every condition has a valid operand for its operator. */
export const isRuleComplete = (rule: IConditionalFormattingRule, date?: ICfDateMeta): boolean =>
    rule.conditions.length > 0 &&
    rule.conditions.every((condition) => {
        const { missing, error } = validateCondition(condition, rule.target.kind, date);
        return !missing && !error;
    });
