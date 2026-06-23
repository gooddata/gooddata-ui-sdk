// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { newAttribute, newBucket, newInsightDefinition, newMeasure } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import {
    type ConditionalFormattingOperator,
    type ConditionalFormattingValue,
    type IConditionalFormattingCondition,
    type IConditionalFormattingRule,
} from "@gooddata/sdk-ui-pivot/next";

import {
    buildTargetOptions,
    isRuleComplete,
    operatorArity,
    operatorIcon,
    operatorsForKind,
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

    it("treats no-operand operators as complete", () => {
        expect(isRuleComplete(measureRule([condition("ALL", { kind: "none" })]))).toBe(true);
        expect(isRuleComplete(attributeRule([condition("IS_EMPTY", { kind: "none" })]))).toBe(true);
    });

    it("rejects a rule with no conditions", () => {
        expect(isRuleComplete(measureRule([]))).toBe(false);
    });
});
