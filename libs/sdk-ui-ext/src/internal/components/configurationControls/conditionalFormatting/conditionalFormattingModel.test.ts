// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import {
    DataViewFirstPage,
    type ScenarioRecording,
    recordedDataView,
} from "@gooddata/sdk-backend-mockingbird";
import { type IDataView } from "@gooddata/sdk-backend-spi";
import {
    isAttributeDescriptor,
    isMeasureGroupDescriptor,
    newAttribute,
    newBucket,
    newInsightDefinition,
    newMeasure,
} from "@gooddata/sdk-model";
import { BucketNames, DataViewFacade } from "@gooddata/sdk-ui";
import {
    type ConditionalFormattingOperator,
    type ConditionalFormattingValue,
    type IConditionalFormatting,
    type IConditionalFormattingCondition,
    type IConditionalFormattingRule,
} from "@gooddata/sdk-ui-pivot/next";

import {
    type ICfDateMeta,
    type ITargetOption,
    buildCfTargetData,
    buildTargetOptions,
    displayToRawNumber,
    isCustomTarget,
    isPercentFormat,
    isRuleComplete,
    operatorArity,
    operatorIcon,
    operatorsForTarget,
    rawToDisplayNumber,
    ruleWithTarget,
    sanitizeRuleForEditing,
    semanticRuleFor,
    validateCondition,
    valueEditorKind,
    valueForOperator,
} from "./conditionalFormattingModel.js";

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

    describe("semantic", () => {
        const DEPARTMENT_LOCAL_ID = "a_f_owner.department_id";
        const MEASURE_LOCAL_ID = "m_87a053b0_3947_49f3_b0c5_de53fd01f050";
        const SEMANTIC = { conditions: [condition("EQUAL_TO", { kind: "literal", value: "Direct Sales" })] };

        // Recordings predate `conditionalFormatting` on descriptors, so it's patched onto a real
        // recorded IDataView's header descriptors rather than hand-built from scratch — everything
        // else (headerItems, definition, ...) stays a real, valid recording.
        function withSemanticOnDescriptor(
            dataView: IDataView,
            target: { attributeLocalId?: string; measureLocalId?: string },
        ): IDataView {
            const dimensions = dataView.result.dimensions.map((dimension) => ({
                ...dimension,
                headers: dimension.headers.map((header) => {
                    if (
                        target.attributeLocalId &&
                        isAttributeDescriptor(header) &&
                        header.attributeHeader.localIdentifier === target.attributeLocalId
                    ) {
                        return {
                            attributeHeader: { ...header.attributeHeader, conditionalFormatting: SEMANTIC },
                        };
                    }
                    if (target.measureLocalId && isMeasureGroupDescriptor(header)) {
                        return {
                            measureGroupHeader: {
                                ...header.measureGroupHeader,
                                items: header.measureGroupHeader.items.map((item) =>
                                    item.measureHeaderItem.localIdentifier === target.measureLocalId
                                        ? {
                                              measureHeaderItem: {
                                                  ...item.measureHeaderItem,
                                                  conditionalFormatting: SEMANTIC,
                                              },
                                          }
                                        : item,
                                ),
                            },
                        };
                    }
                    return header;
                }),
            }));
            // Preserve the recording's prototype chain (attributeHeadersForDim calls a prototype
            // method, `forecast`, that a plain-object spread would drop): the clone's prototype is
            // the original instance itself, so every other property/method falls through to it, and
            // only the own `result` property below shadows it.
            // Preserve the recording's prototype chain (attributeHeadersForDim calls a prototype
            // method, `forecast`, that a plain-object spread would drop): copy own properties onto a
            // new instance of the same prototype, only overriding `result`.
            return Object.assign(Object.create(Object.getPrototypeOf(dataView)), dataView, {
                result: { ...dataView.result, dimensions },
            });
        }

        const baseDataView = () =>
            recordedDataView(
                ReferenceRecordings.Scenarios.PivotTable.TwoMeasuresAndOneSubtotal as ScenarioRecording,
                DataViewFirstPage,
            );

        it("populates semantic for a measure carrying measureHeaderItem.conditionalFormatting", () => {
            const patched = withSemanticOnDescriptor(baseDataView(), { measureLocalId: MEASURE_LOCAL_ID });
            const data = buildCfTargetData(DataViewFacade.for(patched));
            expect(data.semantic[MEASURE_LOCAL_ID]).toEqual(SEMANTIC);
        });

        it("populates semantic for an attribute carrying attributeHeader.conditionalFormatting", () => {
            const patched = withSemanticOnDescriptor(baseDataView(), {
                attributeLocalId: DEPARTMENT_LOCAL_ID,
            });
            const data = buildCfTargetData(DataViewFacade.for(patched));
            expect(data.semantic[DEPARTMENT_LOCAL_ID]).toEqual(SEMANTIC);
        });

        it("omits a target from semantic when its descriptor has no conditionalFormatting", () => {
            const data = buildCfTargetData(DataViewFacade.for(baseDataView()));
            expect(data.semantic[DEPARTMENT_LOCAL_ID]).toBeUndefined();
            expect(data.semantic[MEASURE_LOCAL_ID]).toBeUndefined();
        });
    });
});

describe("isCustomTarget", () => {
    const measureTarget = { kind: "measure" as const, measureIdentifier: "m1" };
    const attributeTarget = { kind: "attribute" as const, attributeIdentifier: "a1" };

    it("returns false when config is undefined", () => {
        expect(isCustomTarget(undefined, measureTarget)).toBe(false);
    });

    it("is true when an insight rule targets it", () => {
        const config: IConditionalFormatting = { enabled: true, rules: [measureRule([])] };
        expect(isCustomTarget(config, measureTarget)).toBe(true);
        expect(isCustomTarget(config, attributeTarget)).toBe(false);
    });

    it("is true when it's listed in customTargets, even with no matching rule", () => {
        const config: IConditionalFormatting = {
            enabled: true,
            rules: [],
            customTargets: [attributeTarget],
        };
        expect(isCustomTarget(config, attributeTarget)).toBe(true);
        expect(isCustomTarget(config, measureTarget)).toBe(false);
    });
});

describe("semanticRuleFor", () => {
    it("synthesizes a rule with a semantic:<kind>:<localId> id and pass-through target/conditions", () => {
        const option: ITargetOption = {
            value: "measure:m1",
            title: "Measure 1",
            target: { kind: "measure", measureIdentifier: "m1" },
        };
        const semantic = { conditions: [condition("GREATER_THAN", { kind: "literal", value: "5" })] };
        const rule = semanticRuleFor(option, semantic);
        expect(rule.id).toBe("semantic:measure:m1");
        expect(rule.target).toEqual(option.target);
        expect(rule.conditions).toBe(semantic.conditions);
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
        expect(valueEditorKind(condition("ALL", { kind: "none" }), "measure", false, false)).toBe("none");
    });

    it("picks the range editor for range operators", () => {
        expect(
            valueEditorKind(
                condition("BETWEEN", { kind: "literalRange", from: 1, to: 5 }),
                "measure",
                false,
                false,
            ),
        ).toBe("range");
    });

    it("picks the number editor for measure single-value operators regardless of suggestions", () => {
        expect(valueEditorKind(literal("GREATER_THAN"), "measure", false, false)).toBe("number");
        expect(valueEditorKind(literal("EQUAL_TO"), "measure", true, false)).toBe("number");
    });

    it("picks the combobox for attribute Is / Is not only when suggestions exist", () => {
        expect(valueEditorKind(literal("EQUAL_TO"), "attribute", true, false)).toBe("combobox");
        expect(valueEditorKind(literal("NOT_EQUAL_TO"), "attribute", true, false)).toBe("combobox");
        expect(valueEditorKind(literal("EQUAL_TO"), "attribute", false, false)).toBe("text");
    });

    it("keeps the plain text editor for attribute substring operators even with suggestions", () => {
        expect(valueEditorKind(literal("CONTAINS"), "attribute", true, false)).toBe("text");
        expect(valueEditorKind(literal("STARTS_WITH"), "attribute", true, false)).toBe("text");
    });

    it("picks the date picker for a date target's single-operand operators, suggestions or not", () => {
        expect(valueEditorKind(literal("EQUAL_TO"), "attribute", true, true)).toBe("date");
        expect(valueEditorKind(literal("GREATER_THAN"), "attribute", false, true)).toBe("date");
        expect(valueEditorKind(condition("ALL", { kind: "none" }), "attribute", false, true)).toBe("none");
    });
});

describe("operatorsForTarget", () => {
    it("offers numeric range operators to measures, not text operators", () => {
        const operators = operatorsForTarget("measure", false);
        expect(operators).toContain("BETWEEN");
        expect(operators).not.toContain("CONTAINS");
    });

    it("offers text operators to attributes, not numeric range operators", () => {
        const operators = operatorsForTarget("attribute", false);
        expect(operators).toContain("CONTAINS");
        expect(operators).not.toContain("BETWEEN");
    });

    it("offers date attributes the date condition set (comparisons, inclusive pair, IS_EMPTY)", () => {
        // No IS_NOT_EMPTY on dates: it means "has any date", which is exactly "All time".
        expect(operatorsForTarget("attribute", true)).toEqual([
            "ALL",
            "EQUAL_TO",
            "NOT_EQUAL_TO",
            "GREATER_THAN",
            "GREATER_THAN_OR_EQUAL_TO",
            "LESS_THAN",
            "LESS_THAN_OR_EQUAL_TO",
            "IS_EMPTY",
        ]);
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
    it("reports empty fields as missing, never as invalid input (the editor gates that on a visit)", () => {
        expect(
            validateCondition(condition("GREATER_THAN", { kind: "literal", value: "" }), "measure"),
        ).toEqual({ missing: true });
        expect(
            validateCondition(condition("BETWEEN", { kind: "literalRange", from: NaN, to: NaN }), "measure"),
        ).toEqual({ missing: true });
    });

    it("reports a non-numeric measure literal as missing, but a textual attribute value as present", () => {
        expect(
            validateCondition(condition("EQUAL_TO", { kind: "literal", value: "abc" }), "measure"),
        ).toEqual({ missing: true });
        expect(
            validateCondition(condition("EQUAL_TO", { kind: "literal", value: "abc" }), "attribute"),
        ).toEqual({ missing: false });
    });

    it("flags a range whose lower bound exceeds its upper bound", () => {
        expect(
            validateCondition(condition("BETWEEN", { kind: "literalRange", from: 5, to: 1 }), "measure"),
        ).toEqual({ missing: false, error: "rangeOrder" });
    });

    it("accepts a valid range and treats a partial range as missing without errors", () => {
        expect(
            validateCondition(condition("BETWEEN", { kind: "literalRange", from: 1, to: 5 }), "measure"),
        ).toEqual({ missing: false });
        expect(
            validateCondition(condition("BETWEEN", { kind: "literalRange", from: 5, to: NaN }), "measure"),
        ).toEqual({ missing: true });
    });

    it("treats no-operand operators as complete", () => {
        expect(validateCondition(condition("ALL", { kind: "none" }), "measure")).toEqual({ missing: false });
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

    it("normalizes an uncurated measure operator instead of leaving it editable (F1-2754)", () => {
        // CONTAINS is a text operator; operatorsForTarget("measure", false) never offers it, so a
        // stored rule carrying it (e.g. an inherited semantic rule) must not reach the dialog as-is.
        const rule = measureRule([condition("CONTAINS", { kind: "literal", value: "5" })]);
        const sanitized = sanitizeRuleForEditing(rule);
        expect(sanitized.conditions[0].operator).toBe("EQUAL_TO");
        expect(sanitized.conditions[0].value).toEqual({ kind: "literal", value: "5" });
        expect(sanitized.conditions[0].id).toBe(rule.conditions[0].id);
        expect(sanitized.conditions[0].format).toEqual(rule.conditions[0].format);
    });

    it("normalizes an uncurated non-date attribute operator instead of leaving it editable (F1-2754)", () => {
        const rule = attributeRule([condition("GREATER_THAN", { kind: "literal", value: "5" })]);
        const sanitized = sanitizeRuleForEditing(rule);
        expect(sanitized.conditions[0].operator).toBe("EQUAL_TO");
    });

    it("coerces AAC-authored text conditions on a date target into unpicked date conditions", () => {
        // The engine evaluates a stored CONTAINS on a date attribute, but the date editor has no
        // controls for it — it opens as an unpicked "Is on" with id and format preserved.
        const textOnDate = attributeRule([
            condition("CONTAINS", { kind: "literal", value: "2023" }),
            condition("ALL", { kind: "literal", value: "stray" }),
        ]);
        const sanitized = sanitizeRuleForEditing(textOnDate, true);
        expect(sanitized.conditions[0].operator).toBe("EQUAL_TO");
        expect(sanitized.conditions[0].value).toEqual({ kind: "none" });
        expect(sanitized.conditions[0].id).toBe(textOnDate.conditions[0].id);
        expect(sanitized.conditions[0].format).toEqual(textOnDate.conditions[0].format);
        // A date-set operator with a stray value keeps its operator, only the value clears.
        expect(sanitized.conditions[1].operator).toBe("ALL");
        expect(sanitized.conditions[1].value).toEqual({ kind: "none" });
    });

    it("clears a stray period off a no-operand date operator (hand-authored IS_EMPTY + period)", () => {
        const emptyWithPeriod = attributeRule([
            condition("IS_EMPTY", { kind: "absoluteDate", from: "2023-12-01", to: "2023-12-31" }),
        ]);
        const sanitized = sanitizeRuleForEditing(emptyWithPeriod, true);
        expect(sanitized.conditions[0].operator).toBe("IS_EMPTY");
        expect(sanitized.conditions[0].value).toEqual({ kind: "none" });
        expect(sanitized.conditions[0].id).toBe(emptyWithPeriod.conditions[0].id);
    });

    it("leaves valid date conditions untouched when sanitizing a date rule", () => {
        const valid = attributeRule([
            condition("EQUAL_TO", { kind: "absoluteDate", from: "2023-12-01", to: "2023-12-31" }),
        ]);
        expect(sanitizeRuleForEditing(valid, true)).toEqual(valid);
    });
});

describe("valueForOperator", () => {
    it("keeps an operand across operator changes of the same shape, resets across shapes", () => {
        const literal: ConditionalFormattingValue = { kind: "literal", value: 5 };
        expect(valueForOperator("GREATER_THAN_OR_EQUAL_TO", literal, false)).toBe(literal);
        expect(valueForOperator("BETWEEN", literal, false)).toEqual({
            kind: "literalRange",
            from: NaN,
            to: NaN,
        });
        expect(valueForOperator("ALL", literal, false)).toEqual({ kind: "none" });
    });

    it("keeps a picked date period across the single-operand date operators, drops it for no-operand ones", () => {
        const period: ConditionalFormattingValue = {
            kind: "absoluteDate",
            from: "2023-12-01",
            to: "2023-12-31",
        };
        expect(valueForOperator("GREATER_THAN", period, true)).toBe(period);
        expect(valueForOperator("NOT_EQUAL_TO", period, true)).toBe(period);
        expect(valueForOperator("ALL", period, true)).toEqual({ kind: "none" });
        // A hidden period on IS_EMPTY would be uneditable AND drift-killable (the engine's
        // unresolvable-guard precedes the emptiness check) — it must clear like ALL does.
        expect(valueForOperator("IS_EMPTY", period, true)).toEqual({ kind: "none" });
    });
});

describe("date conditions (model)", () => {
    const MONTH_META: ICfDateMeta = { granularity: "GDC.time.month", timezone: "Europe/Prague" };
    const dateOption = (granularity: ICfDateMeta["granularity"], id = "orderdate"): ITargetOption => ({
        value: `attribute:${id}`,
        title: "Order date",
        target: { kind: "attribute", attributeIdentifier: id },
        date: { granularity },
    });
    const plainAttributeOption: ITargetOption = {
        value: "attribute:status",
        title: "Status",
        target: { kind: "attribute", attributeIdentifier: "status" },
    };
    const decemberValue: ConditionalFormattingValue = {
        kind: "absoluteDate",
        from: "2023-12-01",
        to: "2023-12-31",
    };

    it("validateCondition: unpicked period is missing; any resolvable period passes; malformed errors", () => {
        expect(validateCondition(condition("EQUAL_TO", { kind: "none" }), "attribute", MONTH_META)).toEqual({
            missing: true,
        });
        expect(validateCondition(condition("EQUAL_TO", decemberValue), "attribute", MONTH_META)).toEqual({
            missing: false,
        });
        // Partial-month bounds resolve by overlap — no longer a drift error.
        expect(
            validateCondition(
                condition("EQUAL_TO", { kind: "absoluteDate", from: "2023-12-02", to: "2023-12-31" }),
                "attribute",
                MONTH_META,
            ),
        ).toEqual({ missing: false });
        // A genuinely malformed value is the remaining inline-error case.
        expect(
            validateCondition(
                condition("EQUAL_TO", { kind: "absoluteDate", from: "12/24/2026", to: "12/26/2026" }),
                "attribute",
                MONTH_META,
            ),
        ).toEqual({ missing: false, error: "dateUnresolvable" });
    });

    it("validateCondition: relative values of any linear granularity resolve; fiscal errors", () => {
        expect(
            validateCondition(
                condition("EQUAL_TO", {
                    kind: "relativeDate",
                    granularity: "GDC.time.month",
                    from: -1,
                    to: 0,
                }),
                "attribute",
                MONTH_META,
            ),
        ).toEqual({ missing: false });
        // A day-granularity value on a month column resolves by overlap.
        expect(
            validateCondition(
                condition("EQUAL_TO", { kind: "relativeDate", granularity: "GDC.time.date", from: 0, to: 0 }),
                "attribute",
                MONTH_META,
            ),
        ).toEqual({ missing: false });
        // Fiscal stays unresolvable until its labeling convention is verified.
        expect(
            validateCondition(
                condition("EQUAL_TO", {
                    kind: "relativeDate",
                    granularity: "GDC.time.fiscal_quarter",
                    from: 0,
                    to: 0,
                }),
                "attribute",
                MONTH_META,
            ),
        ).toEqual({ missing: false, error: "dateUnresolvable" });
    });

    it("isRuleComplete gates Save on the date operand", () => {
        expect(isRuleComplete(attributeRule([condition("EQUAL_TO", { kind: "none" })]), MONTH_META)).toBe(
            false,
        );
        expect(isRuleComplete(attributeRule([condition("EQUAL_TO", decemberValue)]), MONTH_META)).toBe(true);
        // "All time" needs no operand.
        expect(isRuleComplete(attributeRule([condition("ALL", { kind: "none" })]), MONTH_META)).toBe(true);
    });

    it("ruleWithTarget coerces conditions when crossing the date/plain boundary (both directions)", () => {
        const plainRule = attributeRule([condition("CONTAINS", { kind: "literal", value: "x" })]);
        const toDate = ruleWithTarget(plainRule, dateOption("GDC.time.month"), plainAttributeOption);
        expect(toDate.conditions).toHaveLength(1);
        // CONTAINS has no date counterpart -> the date default "Is on"; values always clear.
        expect(toDate.conditions[0].operator).toBe("EQUAL_TO");
        expect(toDate.conditions[0].value).toEqual({ kind: "none" });
        // The visual choices are family-independent and survive the crossing.
        expect(toDate.conditions[0].id).toBe(plainRule.conditions[0].id);
        expect(toDate.conditions[0].format).toEqual(plainRule.conditions[0].format);

        const dateRule = attributeRule([condition("EQUAL_TO", decemberValue)]);
        const toPlain = ruleWithTarget(dateRule, plainAttributeOption, dateOption("GDC.time.month"));
        expect(toPlain.conditions).toHaveLength(1);
        // "Is on" maps onto the attribute "Is" — the operator survives, the date value cannot.
        expect(toPlain.conditions[0].operator).toBe("EQUAL_TO");
        expect(toPlain.conditions[0].value).toEqual({ kind: "literal", value: "" });
    });

    it("ruleWithTarget infers date-ness from the conditions when the previous target is gone (invalid rule)", () => {
        // The old date target left the insight, so `previous` is undefined; retargeting to a plain
        // attribute must still coerce — stale date values would otherwise leak onto a target whose
        // editor can neither show nor clear them.
        const orphanedDateRule = attributeRule([condition("EQUAL_TO", decemberValue)]);
        const toPlain = ruleWithTarget(orphanedDateRule, plainAttributeOption, undefined);
        expect(toPlain.conditions).toHaveLength(1);
        expect(toPlain.conditions[0].operator).toBe("EQUAL_TO");
        expect(toPlain.conditions[0].value).toEqual({ kind: "literal", value: "" });

        // Retargeting the same orphaned date rule to another DATE target keeps operators and only
        // clears values (a granularity change against an unknown previous granularity).
        const toDate = ruleWithTarget(orphanedDateRule, dateOption("GDC.time.month"), undefined);
        expect(toDate.conditions[0].operator).toBe("EQUAL_TO");
        expect(toDate.conditions[0].value).toEqual({ kind: "none" });

        // Shapes the inference cannot classify (ALL-only, IS_EMPTY-only — valid in both families):
        // whichever way they route, the coercion must be an identity — an orphaned date rule
        // retargeted to another date attribute keeps its operator and color/format.
        const ambiguous = attributeRule([
            { ...condition("IS_EMPTY", { kind: "none" }), format: { color: "#123456", scope: "row" } },
        ]);
        const ambiguousToDate = ruleWithTarget(ambiguous, dateOption("GDC.time.month"), undefined);
        expect(ambiguousToDate.conditions[0].id).toBe(ambiguous.conditions[0].id);
        expect(ambiguousToDate.conditions[0].operator).toBe("IS_EMPTY");
        expect(ambiguousToDate.conditions[0].value).toEqual({ kind: "none" });
        expect(ambiguousToDate.conditions[0].format).toEqual({ color: "#123456", scope: "row" });
    });

    it("ruleWithTarget keeps operators but clears values on a granularity change; keeps all else equal", () => {
        const dateRule = attributeRule([condition("GREATER_THAN", decemberValue)]);
        const changed = ruleWithTarget(
            dateRule,
            dateOption("GDC.time.date", "orderday"),
            dateOption("GDC.time.month"),
        );
        expect(changed.conditions[0].operator).toBe("GREATER_THAN");
        expect(changed.conditions[0].value).toEqual({ kind: "none" });

        const kept = ruleWithTarget(
            dateRule,
            dateOption("GDC.time.month", "otherdate"),
            dateOption("GDC.time.month"),
        );
        expect(kept.conditions).toEqual(dateRule.conditions);
    });
});
