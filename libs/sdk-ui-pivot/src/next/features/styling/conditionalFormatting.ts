// (C) 2026 GoodData Corporation

import { isResultAttributeHeader } from "@gooddata/sdk-model";
import {
    type ITableColumnDefinition,
    type ITableDataHeaderScope,
    type ITableDataValue,
    isAttributeColumnDefinition,
    isMeasureGroupValueColumnDefinition,
    isMeasureScope,
    isValueColumnDefinition,
} from "@gooddata/sdk-ui";

import {
    type ConditionalFormattingDateBounds,
    type ConditionalFormattingOperator,
    type ConditionalFormattingTarget,
    type ConditionalFormattingTriggerColIds,
    type ConditionalFormattingValue,
    type IConditionalFormatting,
    type IConditionalFormattingCondition,
    type IConditionalFormattingFormat,
    type IDateConditionBounds,
} from "../../types/conditionalFormatting.js";
import { type AgGridRowData } from "../../types/internal.js";
import { type ColumnHeadersPosition } from "../../types/transposition.js";
import { columnDefinitionToColId } from "../columns/colId.js";

import { isTotalCell } from "./cellClassification.js";
import {
    type IDateResolutionContext,
    isDateConditionValue,
    resolveDateConditionBounds,
} from "./dateConditionResolution.js";

/**
 * The colors a matched cell/row receives — a subset of ag-grid CellStyle, merged on top of the
 * format-string-derived styling by the caller.
 *
 * @internal
 */
interface IConditionalFormattingStyle {
    color?: string;
    backgroundColor?: string;
}

// Reads BOTH column and row scope so the measure is found wherever transposition places it (mirrors
// `valueRow/value.ts`). This is what gates the shared transposed value column to its own measure's rows.
const cellHoldsMeasure = (cell: ITableDataValue, measureLocalId: string): boolean => {
    const matchesMeasure = (scope: ITableDataHeaderScope): boolean =>
        isMeasureScope(scope) && scope.descriptor.measureHeaderItem.localIdentifier === measureLocalId;
    const columnScope =
        "columnDefinition" in cell && "columnScope" in cell.columnDefinition
            ? cell.columnDefinition.columnScope
            : undefined;
    const rowScope =
        "rowDefinition" in cell && "rowScope" in cell.rowDefinition ? cell.rowDefinition.rowScope : undefined;
    return Boolean(columnScope?.some(matchesMeasure)) || Boolean(rowScope?.some(matchesMeasure));
};

// The measure a value column names in its own scope, or `undefined` for the shared transposed column.
const columnMeasureLocalId = (columnDefinition: ITableColumnDefinition): string | undefined => {
    if (!isValueColumnDefinition(columnDefinition)) {
        return undefined;
    }
    return columnDefinition.columnScope.find(isMeasureScope)?.descriptor.measureHeaderItem.localIdentifier;
};

// Layout-agnostic membership test. Attribute → its row-header column. Measure → any value column
// naming that measure, or naming none (the shared transposed column, gated per row by cellHoldsMeasure).
const columnHoldsTarget = (
    columnDefinition: ITableColumnDefinition,
    target: ConditionalFormattingTarget,
): boolean => {
    if (target.kind === "attribute") {
        return (
            isAttributeColumnDefinition(columnDefinition) &&
            columnDefinition.attributeDescriptor.attributeHeader.localIdentifier ===
                target.attributeIdentifier
        );
    }
    if (
        !isValueColumnDefinition(columnDefinition) &&
        !isMeasureGroupValueColumnDefinition(columnDefinition)
    ) {
        return false;
    }
    const colMeasure = columnMeasureLocalId(columnDefinition);
    return colMeasure === undefined || colMeasure === target.measureIdentifier;
};

/**
 * Resolves each rule's target to the colIds of every column that may hold its value, once per render
 * (column membership is fixed per render). Aligned to `config.rules` by index; see
 * {@link ConditionalFormattingTriggerColIds}.
 *
 * @internal
 */
export function resolveConditionalFormattingTriggers(
    config: IConditionalFormatting,
    columnDefinitions: readonly ITableColumnDefinition[],
    columnHeadersPosition: ColumnHeadersPosition,
): ConditionalFormattingTriggerColIds {
    return config.rules.map((rule) =>
        columnDefinitions
            .filter((columnDefinition) => columnHoldsTarget(columnDefinition, rule.target))
            .map((columnDefinition) => columnDefinitionToColId(columnDefinition, columnHeadersPosition)),
    );
}

const dateBoundsKey = (ruleIndex: number, conditionId: string): string => `${ruleIndex}:${conditionId}`;

/**
 * Resolves every date-valued condition to label-space bounds at its target column's granularity,
 * once per render (bounds depend only on the config, the column descriptors, and the anchor).
 * Keyed by `<ruleIndex>:<conditionId>`; `null` = unresolvable (never matches). Non-date conditions
 * are absent.
 *
 * @internal
 */
export function resolveConditionalFormattingDateBounds(
    config: IConditionalFormatting,
    columnDefinitions: readonly ITableColumnDefinition[],
    context?: IDateResolutionContext,
): ConditionalFormattingDateBounds {
    // Single anchor so every relative condition sees the same current period.
    const resolutionContext: IDateResolutionContext = { anchor: context?.anchor ?? new Date() };
    const bounds: Record<string, IDateConditionBounds | null> = {};
    config.rules.forEach((rule, ruleIndex) => {
        if (!rule.conditions.some((condition) => isDateConditionValue(condition.value))) {
            return;
        }
        // Date conditions target attributes; the target's column carries granularity + timezone.
        const attributeIdentifier =
            rule.target.kind === "attribute" ? rule.target.attributeIdentifier : undefined;
        const targetColumn = columnDefinitions.find(
            (columnDefinition) =>
                isAttributeColumnDefinition(columnDefinition) &&
                columnDefinition.attributeDescriptor.attributeHeader.localIdentifier === attributeIdentifier,
        );
        const attributeHeader = isAttributeColumnDefinition(targetColumn)
            ? targetColumn.attributeDescriptor.attributeHeader
            : undefined;
        for (const condition of rule.conditions) {
            if (isDateConditionValue(condition.value)) {
                bounds[dateBoundsKey(ruleIndex, condition.id)] = resolveDateConditionBounds(
                    condition.value,
                    attributeHeader?.granularity,
                    attributeHeader?.format?.timezone,
                    resolutionContext,
                );
            }
        }
    });
    return bounds;
}

const TEXT_OPERATORS: ReadonlySet<ConditionalFormattingOperator> = new Set<ConditionalFormattingOperator>([
    "CONTAINS",
    "NOT_CONTAINS",
    "STARTS_WITH",
    "NOT_STARTS_WITH",
    "ENDS_WITH",
    "NOT_ENDS_WITH",
]);

const matchesNumeric = (
    operator: ConditionalFormattingOperator,
    value: ConditionalFormattingValue,
    raw: number,
): boolean => {
    if (value.kind === "literalRange") {
        // Non-finite bound matches nothing — else NOT_BETWEEN with a NaN bound would paint every cell.
        if (!Number.isFinite(value.from) || !Number.isFinite(value.to)) {
            return false;
        }
        // Normalize a backwards range (from > to) so it still means "between the two numbers".
        const inRange = raw >= Math.min(value.from, value.to) && raw <= Math.max(value.from, value.to);
        return operator === "BETWEEN" ? inRange : !inRange;
    }
    if (value.kind !== "literal") {
        return false;
    }
    // Coerce numeric strings (persisted/AAC JSON can carry "5") so a measure rule isn't silently skipped.
    const threshold = typeof value.value === "number" ? value.value : Number(value.value);
    if (Number.isNaN(threshold)) {
        return false;
    }
    switch (operator) {
        case "EQUAL_TO":
            return raw === threshold;
        case "NOT_EQUAL_TO":
            return raw !== threshold;
        case "LESS_THAN":
            return raw < threshold;
        case "LESS_THAN_OR_EQUAL_TO":
            return raw <= threshold;
        case "GREATER_THAN":
            return raw > threshold;
        case "GREATER_THAN_OR_EQUAL_TO":
            return raw >= threshold;
        default:
            return false;
    }
};

const matchesText = (
    operator: ConditionalFormattingOperator,
    value: ConditionalFormattingValue,
    raw: string,
): boolean => {
    if (value.kind !== "literal") {
        return false;
    }
    const target = String(value.value).toLowerCase();
    const text = raw.toLowerCase();
    switch (operator) {
        case "EQUAL_TO":
            return text === target;
        case "NOT_EQUAL_TO":
            return text !== target;
        case "CONTAINS":
            return text.includes(target);
        case "NOT_CONTAINS":
            return !text.includes(target);
        case "STARTS_WITH":
            return text.startsWith(target);
        case "NOT_STARTS_WITH":
            return !text.startsWith(target);
        case "ENDS_WITH":
            return text.endsWith(target);
        case "NOT_ENDS_WITH":
            return !text.endsWith(target);
        default:
            return false;
    }
};

/**
 * Emptiness as conditional formatting means it — deliberately distinct from cell.ts's null-styling
 * notion. Measure columns are empty only when the RAW value is null/undefined (so a genuine 0 that a
 * "hide zeros" format renders as "" is NOT treated as empty); attribute columns are empty when the
 * element has no displayed value. (cell.ts keeps its own formattedValue-based check for null styling.)
 */
const isEmptyTriggerCell = (
    cell: ITableDataValue,
    targetKind: ConditionalFormattingTarget["kind"],
): boolean => {
    if (targetKind === "attribute") {
        return cell.formattedValue === null || cell.formattedValue === "";
    }
    if (!("value" in cell)) {
        return true;
    }
    return cell.value === null || cell.value === undefined;
};

// Raw wire label ("2023-12"), never the localized formattedValue ("Dec 2023"): comparison must
// stay portable to a server evaluator. Null when the cell carries no attribute header.
const attributeWireLabel = (cell: ITableDataValue): string | null => {
    if (!("value" in cell) || !isResultAttributeHeader(cell.value)) {
        return null;
    }
    const name = cell.value.attributeHeaderItem.name;
    return typeof name === "string" ? name : null;
};

// Labels are fixed-width and zero-padded, so period containment/ordering are plain string compares.
const matchesDateLabel = (
    operator: ConditionalFormattingOperator,
    label: string,
    bounds: IDateConditionBounds,
): boolean => {
    switch (operator) {
        case "EQUAL_TO":
            return label >= bounds.fromLabel && label <= bounds.toLabel;
        case "NOT_EQUAL_TO":
            return label < bounds.fromLabel || label > bounds.toLabel;
        case "GREATER_THAN":
            return label > bounds.toLabel;
        case "GREATER_THAN_OR_EQUAL_TO":
            return label >= bounds.fromLabel;
        case "LESS_THAN":
            return label < bounds.fromLabel;
        case "LESS_THAN_OR_EQUAL_TO":
            return label <= bounds.toLabel;
        default:
            return false;
    }
};

const conditionMatches = (
    condition: IConditionalFormattingCondition,
    triggerCell: ITableDataValue,
    targetKind: ConditionalFormattingTarget["kind"],
    dateBounds: IDateConditionBounds | null | undefined,
): boolean => {
    if (isDateConditionValue(condition.value) && !dateBounds) {
        return false;
    }

    const empty = isEmptyTriggerCell(triggerCell, targetKind);

    if (condition.operator === "IS_EMPTY") {
        return empty;
    }
    if (condition.operator === "IS_NOT_EMPTY") {
        return !empty;
    }
    // Every other operator never matches an empty cell.
    if (empty) {
        return false;
    }
    if (condition.operator === "ALL") {
        return true;
    }

    if (isDateConditionValue(condition.value) && dateBounds) {
        const label = attributeWireLabel(triggerCell);
        return label === null ? false : matchesDateLabel(condition.operator, label, dateBounds);
    }

    // Text operators are attribute-only — on a measure they'd match the locale-dependent formatted
    // string, unportable to a server evaluator.
    if (TEXT_OPERATORS.has(condition.operator) && targetKind !== "attribute") {
        return false;
    }
    if (targetKind === "attribute") {
        return matchesText(condition.operator, condition.value, attributeWireLabel(triggerCell) ?? "");
    }

    if (!("value" in triggerCell)) {
        return false;
    }
    const raw = typeof triggerCell.value === "number" ? triggerCell.value : Number(triggerCell.value);
    if (Number.isNaN(raw)) {
        return false;
    }
    return matchesNumeric(condition.operator, condition.value, raw);
};

const toFragment = (format: IConditionalFormattingFormat): IConditionalFormattingStyle => ({
    ...(format.color ? { color: format.color } : {}),
    ...(format.backgroundColor ? { backgroundColor: format.backgroundColor } : {}),
});

/**
 * Evaluates the conditional-formatting config for one rendered cell; returns the style fragment to
 * apply, or undefined if no rule matches.
 *
 * Precedence is strict first-match-wins, by rule order then condition order. The winning condition's
 * scope decides what it paints: `row` the whole row, `cell` only the trigger cell. Total/subtotal
 * rows are never evaluated.
 *
 * @internal
 */
export function evaluateConditionalFormatting(
    config: IConditionalFormatting,
    triggerColIdsByRule: ConditionalFormattingTriggerColIds,
    rowData: AgGridRowData,
    currentColId: string,
    dateBoundsByCondition?: ConditionalFormattingDateBounds,
): IConditionalFormattingStyle | undefined {
    if (!config.enabled) {
        return undefined;
    }
    const currentCell = rowData.cellDataByColId[currentColId];
    if (!currentCell || isTotalCell(currentCell)) {
        return undefined;
    }

    for (let i = 0; i < config.rules.length; i++) {
        const rule = config.rules[i];
        for (const triggerColId of triggerColIdsByRule[i] ?? []) {
            const triggerCell = rowData.cellDataByColId[triggerColId];
            if (!triggerCell || isTotalCell(triggerCell)) {
                continue;
            }
            // Gate the shared transposed value column to this row's measure (attributes are already pinned).
            if (
                rule.target.kind === "measure" &&
                !cellHoldsMeasure(triggerCell, rule.target.measureIdentifier)
            ) {
                continue;
            }

            for (const condition of rule.conditions) {
                const dateBounds = isDateConditionValue(condition.value)
                    ? dateBoundsByCondition?.[dateBoundsKey(i, condition.id)]
                    : undefined;
                if (!conditionMatches(condition, triggerCell, rule.target.kind, dateBounds)) {
                    continue;
                }
                // First match wins the rule: row-scope paints any cell, cell-scope only the trigger cell.
                if (condition.format.scope === "row") {
                    return toFragment(condition.format);
                }
                if (triggerColId === currentColId) {
                    return toFragment(condition.format);
                }
                break;
            }
        }
    }

    return undefined;
}
