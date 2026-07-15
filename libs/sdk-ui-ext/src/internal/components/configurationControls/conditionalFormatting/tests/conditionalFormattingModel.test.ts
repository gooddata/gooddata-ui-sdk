// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import {
    DataViewFirstPage,
    type ScenarioRecording,
    recordedDataView,
} from "@gooddata/sdk-backend-mockingbird";
import { newAttribute, newBucket, newInsightDefinition, newMeasure } from "@gooddata/sdk-model";
import { BucketNames, DataViewFacade } from "@gooddata/sdk-ui";
import {
    type ConditionalFormattingOperator,
    type ConditionalFormattingValue,
    type IConditionalFormattingCondition,
    type IConditionalFormattingRule,
} from "@gooddata/sdk-ui-pivot/next";

import {
    type ITargetOption,
    buildCfTargetData,
    buildTargetOptions,
    displayToRawNumber,
    isPercentFormat,
    isRuleComplete,
    operatorArity,
    operatorIcon,
    operatorsForKind,
    rawToDisplayNumber,
    ruleWithTarget,
    sanitizeRuleForEditing,
    validateCondition,
    valueEditorKind,
} from "../conditionalFormattingModel.js";

const condition = (
    operator: ConditionalFormattingOperator,
    value: ConditionalFormattingValue,
): IConditionalFormattingCondition => ({
    id: "c1",
    operator,
    value,
    format: { backgroundColor: "#E54D40", scope: "cell" },
});

const measureRule = (conditions: IConditionalFormattingCondition[]): IConditionalFormattingRule => ({
    id: "r1",
    target: { kind: "measure", measureIdentifier: "m1" },
    conditions,
});

const attributeRule = (conditions: IConditionalFormattingCondition[]): IConditionalFormattingRule => ({
    id: "r2",
    target: { kind: "attribute", attributeIdentifier: "a1" },
    conditions,
});

describe("buildTargetOptions", () => {
    const insight = newInsightDefinition("local:table", (i) =>
        i.buckets([
            newBucket(
                BucketNames.MEASURES,
                newMeasure("m1", (m) => m.localId("m1")),
            ),
            newBucket(
                BucketNames.ATTRIBUTE,
                newAttribute("rowDf", (a) => a.localId("rowAttr")),
            ),
            newBucket(
                BucketNames.COLUMNS,
                newAttribute("colDf", (a) => a.localId("colAttr")),
            ),
        ]),
    );

    it("offers measures and row attributes, but never column attributes", () => {
        const values = buildTargetOptions(insight).map((option) => option.value);
        expect(values).toContain("measure:m1");
        expect(values).toContain("attribute:rowAttr");
        // A column attribute defines columns, not a per-row value, so it must not be offered (picking
        // it would resolve to no column and silently format nothing).
        expect(values).not.toContain("attribute:colAttr");
    });

    it("derives percent-ness from the execution-resolved format (attributes never have it)", () => {
        const options = buildTargetOptions(insight, { formats: { m1: "#,##0.0%" } });
        expect(options.find((option) => option.value === "measure:m1")?.isPercent).toBe(true);
        expect(options.find((option) => option.value === "attribute:rowAttr")?.isPercent).toBeUndefined();
    });

    it("prefers the insight-level measure format over the (possibly stale) execution-resolved one", () => {
        const withFormat = newInsightDefinition("local:table", (i) =>
            i.buckets([
                newBucket(
                    BucketNames.MEASURES,
                    newMeasure("m1", (m) => m.localId("m1").format("#,##0.00")),
                ),
            ]),
        );
        const options = buildTargetOptions(withFormat, { formats: { m1: "#,##0.0%" } });
        expect(options.find((option) => option.value === "measure:m1")?.isPercent).toBe(false);
    });

    it("treats a formatless show-in-% measure as percent without waiting for an execution", () => {
        const withRatio = newInsightDefinition("local:table", (i) =>
            i.buckets([
                newBucket(
                    BucketNames.MEASURES,
                    newMeasure("m1", (m) => m.localId("m1").ratio()),
                ),
            ]),
        );
        const options = buildTargetOptions(withRatio);
        expect(options.find((option) => option.value === "measure:m1")?.isPercent).toBe(true);
    });

    it("attaches element suggestions to attribute options (not to measures)", () => {
        const options = buildTargetOptions(insight, { elements: { rowAttr: ["High", "Low"] } });
        expect(options.find((option) => option.value === "attribute:rowAttr")?.elements).toEqual([
            "High",
            "Low",
        ]);
        expect(options.find((option) => option.value === "measure:m1")?.elements).toBeUndefined();
    });
});

describe("buildCfTargetData", () => {
    it("collects distinct element titles per attribute from the data view", () => {
        const dataView = DataViewFacade.for(
            recordedDataView(
                // Casting recorded JSON to ScenarioRecording is the repo-wide idiom for fixtures.
                ReferenceRecordings.Scenarios.PivotTable.SingleAttribute as ScenarioRecording,
                DataViewFirstPage,
            ),
        );
        const productElements = buildCfTargetData(dataView).elements["a_label.f_product.product.name"];
        expect(productElements).toBeDefined();
        expect(productElements).toContain("CompuSci");
        // Distinct: no duplicates among the collected titles.
        expect(new Set(productElements).size).toBe(productElements.length);
    });

    it("skips total headers riding in attribute header groups (totals are not element values)", () => {
        const dataView = DataViewFacade.for(
            recordedDataView(
                ReferenceRecordings.Scenarios.PivotTable.TwoMeasuresAndOneSubtotal as ScenarioRecording,
                DataViewFirstPage,
            ),
        );
        const data = buildCfTargetData(dataView);
        const departments = data.elements["a_f_owner.department_id"];
        expect(departments).toContain("Direct Sales");
        expect(departments).not.toContain("sum");
        // Titles resolve from the same walk.
        expect(data.titles["a_f_owner.department_id"]).toBe("Department");
    });
});

describe("isPercentFormat", () => {
    it("detects a percent format by the % sign", () => {
        expect(isPercentFormat("#,##0.0%")).toBe(true);
        expect(isPercentFormat("0.00%")).toBe(true);
    });

    it("returns false for non-percent or missing formats", () => {
        expect(isPercentFormat("#,##0.00")).toBe(false);
        expect(isPercentFormat(undefined)).toBe(false);
        expect(isPercentFormat("")).toBe(false);
    });

    it("ignores literal % signs (quoted or escaped) that render without percent scaling", () => {
        expect(isPercentFormat('#,##0.0"%"')).toBe(false);
        expect(isPercentFormat("#,##0.0\\%")).toBe(false);
        // A scaling % outside the literal still counts.
        expect(isPercentFormat('"pct: "0.0%')).toBe(true);
    });
});

describe("percent value conversion", () => {
    it("scales raw <-> display for percent measures and round-trips cleanly", () => {
        expect(rawToDisplayNumber(0.4, true)).toBe(40);
        expect(displayToRawNumber(40, true)).toBe(0.4);
        // 0.105 * 100 would be 10.499999999999998 without denoising.
        expect(rawToDisplayNumber(0.105, true)).toBe(10.5);
        expect(displayToRawNumber(10.5, true)).toBe(0.105);
    });

    it("round-trips negative percent thresholds", () => {
        expect(rawToDisplayNumber(-0.1, true)).toBe(-10);
        expect(displayToRawNumber(-10, true)).toBe(-0.1);
    });

    it("is a no-op for non-percent measures", () => {
        expect(rawToDisplayNumber(0.4, false)).toBe(0.4);
        expect(displayToRawNumber(40, false)).toBe(40);
    });
});

describe("operatorArity", () => {
    it("treats ALL / IS_EMPTY / IS_NOT_EMPTY as no-operand", () => {
        expect(operatorArity("ALL")).toBe("none");
        expect(operatorArity("IS_EMPTY")).toBe("none");
        expect(operatorArity("IS_NOT_EMPTY")).toBe("none");
    });

    it("treats BETWEEN / NOT_BETWEEN as range", () => {
        expect(operatorArity("BETWEEN")).toBe("range");
        expect(operatorArity("NOT_BETWEEN")).toBe("range");
    });

    it("treats comparison and text operators as single", () => {
        expect(operatorArity("GREATER_THAN")).toBe("single");
        expect(operatorArity("EQUAL_TO")).toBe("single");
        expect(operatorArity("CONTAINS")).toBe("single");
    });
});

describe("valueEditorKind", () => {
    const literal = (operator: ConditionalFormattingOperator) =>
        condition(operator, { kind: "literal", value: "" });

    it("picks no editor for no-operand operators", () => {
        expect(valueEditorKind(condition("ALL", { kind: "none" }), "measure", false)).toBe("none");
    });

    it("picks the range editor for range operators", () => {
        expect(
            valueEditorKind(condition("BETWEEN", { kind: "literalRange", from: 1, to: 5 }), "measure", false),
        ).toBe("range");
    });

    it("picks the number editor for measure single-value operators regardless of suggestions", () => {
        expect(valueEditorKind(literal("GREATER_THAN"), "measure", false)).toBe("number");
        expect(valueEditorKind(literal("EQUAL_TO"), "measure", true)).toBe("number");
    });

    it("picks the combobox for attribute Is / Is not only when suggestions exist", () => {
        expect(valueEditorKind(literal("EQUAL_TO"), "attribute", true)).toBe("combobox");
        expect(valueEditorKind(literal("NOT_EQUAL_TO"), "attribute", true)).toBe("combobox");
        expect(valueEditorKind(literal("EQUAL_TO"), "attribute", false)).toBe("text");
    });

    it("keeps the plain text editor for attribute substring operators even with suggestions", () => {
        expect(valueEditorKind(literal("CONTAINS"), "attribute", true)).toBe("text");
        expect(valueEditorKind(literal("STARTS_WITH"), "attribute", true)).toBe("text");
    });
});

describe("operatorsForKind", () => {
    it("offers numeric range operators to measures, not text operators", () => {
        const operators = operatorsForKind("measure");
        expect(operators).toContain("BETWEEN");
        expect(operators).not.toContain("CONTAINS");
    });

    it("offers text operators to attributes, not numeric range operators", () => {
        const operators = operatorsForKind("attribute");
        expect(operators).toContain("CONTAINS");
        expect(operators).not.toContain("BETWEEN");
    });
});

describe("operatorIcon", () => {
    it("returns shared gd-icon classes for numeric/common operators", () => {
        expect(operatorIcon("GREATER_THAN")).toBe("gd-icon-greater-than");
        expect(operatorIcon("ALL")).toBe("gd-icon-all");
    });

    it("returns undefined for text and empty operators (label-only)", () => {
        expect(operatorIcon("CONTAINS")).toBeUndefined();
        expect(operatorIcon("IS_EMPTY")).toBeUndefined();
    });
});

describe("isRuleComplete", () => {
    it("rejects an empty measure threshold (regression: Number('') === 0)", () => {
        expect(isRuleComplete(measureRule([condition("GREATER_THAN", { kind: "literal", value: "" })]))).toBe(
            false,
        );
        expect(
            isRuleComplete(measureRule([condition("GREATER_THAN", { kind: "literal", value: "  " })])),
        ).toBe(false);
    });

    it("rejects a non-numeric measure threshold", () => {
        expect(
            isRuleComplete(measureRule([condition("GREATER_THAN", { kind: "literal", value: "abc" })])),
        ).toBe(false);
    });

    it("accepts a numeric measure threshold (including a string '5' and 0)", () => {
        expect(
            isRuleComplete(measureRule([condition("GREATER_THAN", { kind: "literal", value: "5" })])),
        ).toBe(true);
        expect(
            isRuleComplete(measureRule([condition("GREATER_THAN", { kind: "literal", value: "0" })])),
        ).toBe(true);
    });

    it("rejects an empty attribute value but accepts a non-empty one", () => {
        expect(isRuleComplete(attributeRule([condition("CONTAINS", { kind: "literal", value: "" })]))).toBe(
            false,
        );
        expect(isRuleComplete(attributeRule([condition("CONTAINS", { kind: "literal", value: "x" })]))).toBe(
            true,
        );
    });

    it("requires both finite bounds for a range operator", () => {
        expect(
            isRuleComplete(measureRule([condition("BETWEEN", { kind: "literalRange", from: 1, to: NaN })])),
        ).toBe(false);
        expect(
            isRuleComplete(measureRule([condition("BETWEEN", { kind: "literalRange", from: 1, to: 5 })])),
        ).toBe(true);
    });

    it("rejects a range whose lower bound exceeds its upper bound", () => {
        expect(
            isRuleComplete(measureRule([condition("BETWEEN", { kind: "literalRange", from: 5, to: 1 })])),
        ).toBe(false);
        expect(
            isRuleComplete(measureRule([condition("BETWEEN", { kind: "literalRange", from: 5, to: 5 })])),
        ).toBe(true);
    });

    it("treats no-operand operators as complete", () => {
        expect(isRuleComplete(measureRule([condition("ALL", { kind: "none" })]))).toBe(true);
        expect(isRuleComplete(attributeRule([condition("IS_EMPTY", { kind: "none" })]))).toBe(true);
    });

    it("rejects a rule with no conditions", () => {
        expect(isRuleComplete(measureRule([]))).toBe(false);
    });
});

describe("validateCondition", () => {
    it("reports empty fields as missing, never as errors (the disabled Save button covers them)", () => {
        expect(
            validateCondition(condition("GREATER_THAN", { kind: "literal", value: "" }), "measure"),
        ).toEqual({ missing: true, errors: {} });
        expect(
            validateCondition(condition("BETWEEN", { kind: "literalRange", from: NaN, to: NaN }), "measure"),
        ).toEqual({ missing: true, errors: {} });
    });

    it("reports a non-numeric measure literal as missing, but a textual attribute value as present", () => {
        expect(
            validateCondition(condition("EQUAL_TO", { kind: "literal", value: "abc" }), "measure"),
        ).toEqual({ missing: true, errors: {} });
        expect(
            validateCondition(condition("EQUAL_TO", { kind: "literal", value: "abc" }), "attribute"),
        ).toEqual({ missing: false, errors: {} });
    });

    it("flags a range whose lower bound exceeds its upper bound", () => {
        expect(
            validateCondition(condition("BETWEEN", { kind: "literalRange", from: 5, to: 1 }), "measure"),
        ).toEqual({ missing: false, errors: { range: "rangeOrder" } });
    });

    it("accepts a valid range and treats a partial range as missing without errors", () => {
        expect(
            validateCondition(condition("BETWEEN", { kind: "literalRange", from: 1, to: 5 }), "measure"),
        ).toEqual({ missing: false, errors: {} });
        expect(
            validateCondition(condition("BETWEEN", { kind: "literalRange", from: 5, to: NaN }), "measure"),
        ).toEqual({ missing: true, errors: {} });
    });

    it("treats no-operand operators as complete", () => {
        expect(validateCondition(condition("ALL", { kind: "none" }), "measure")).toEqual({
            missing: false,
            errors: {},
        });
    });
});

describe("ruleWithTarget", () => {
    const measureOption = (id: string, isPercent: boolean): ITargetOption => ({
        value: `measure:${id}`,
        title: id,
        target: { kind: "measure", measureIdentifier: id },
        isPercent,
    });

    it("keeps conditions on a same-kind switch when percent-ness matches", () => {
        const rule = measureRule([condition("GREATER_THAN", { kind: "literal", value: 5 })]);
        const next = ruleWithTarget(rule, measureOption("m2", false), measureOption("m1", false));
        expect(next.target).toEqual({ kind: "measure", measureIdentifier: "m2" });
        expect(next.conditions).toEqual(rule.conditions);
    });

    it("clears condition values (keeping operators) when crossing the percent boundary", () => {
        const rule = measureRule([
            condition("GREATER_THAN", { kind: "literal", value: 0.4 }),
            condition("BETWEEN", { kind: "literalRange", from: 0.1, to: 0.2 }),
        ]);
        const next = ruleWithTarget(rule, measureOption("m2", true), measureOption("m1", false));
        expect(next.conditions[0].operator).toBe("GREATER_THAN");
        expect(next.conditions[0].value).toEqual({ kind: "literal", value: "" });
        expect(next.conditions[1].value).toEqual({ kind: "literalRange", from: NaN, to: NaN });
    });

    it("resets conditions entirely when the target kind changes", () => {
        const rule = measureRule([condition("GREATER_THAN", { kind: "literal", value: 5 })]);
        const attributeOption: ITargetOption = {
            value: "attribute:a1",
            title: "a1",
            target: { kind: "attribute", attributeIdentifier: "a1" },
        };
        const next = ruleWithTarget(rule, attributeOption, measureOption("m1", false));
        expect(next.target.kind).toBe("attribute");
        expect(next.conditions).toHaveLength(1);
        expect(next.conditions[0].operator).toBe("ALL");
    });
});

describe("sanitizeRuleForEditing", () => {
    it("coerces a stored non-numeric measure literal to the empty sentinel", () => {
        const rule = measureRule([condition("GREATER_THAN", { kind: "literal", value: "abc" })]);
        expect(sanitizeRuleForEditing(rule).conditions[0].value).toEqual({ kind: "literal", value: "" });
    });

    it("keeps numeric measure literals and attribute values untouched", () => {
        const numeric = measureRule([condition("GREATER_THAN", { kind: "literal", value: "5" })]);
        expect(sanitizeRuleForEditing(numeric)).toEqual(numeric);
        const attribute = attributeRule([condition("CONTAINS", { kind: "literal", value: "abc" })]);
        expect(sanitizeRuleForEditing(attribute)).toEqual(attribute);
    });
});
