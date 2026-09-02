// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IConditionalFormatting,
    type IConditionalFormattingCondition,
    type IInsight,
    uriRef,
} from "@gooddata/sdk-model";

import {
    convertConditionalFormatting,
    convertConditionalFormattingToBackend,
} from "./ConditionalFormattingConverter.js";

const insightWith = (conditionalFormatting: unknown): IInsight => ({
    insight: {
        visualizationUrl: "local:table",
        title: "t",
        buckets: [],
        filters: [],
        sorts: [],
        properties: { controls: { conditionalFormatting } },
        identifier: "i",
        uri: "/i",
        ref: uriRef("/i"),
    },
});

// A maximal, valid config exercising every value kind, both target kinds, both scopes — and the two
// fields the projection deliberately drops (version, suppressedTargets).
const maximal: IConditionalFormatting = {
    version: "1",
    enabled: true,
    suppressedTargets: [{ kind: "attribute", attributeIdentifier: "a1" }],
    rules: [
        {
            id: "r1",
            target: { kind: "measure", measureIdentifier: "m1" },
            conditions: [
                {
                    id: "c1",
                    operator: "GREATER_THAN",
                    value: { kind: "literal", value: 100 },
                    format: { backgroundColor: "#3DB36B", scope: "cell" },
                },
                {
                    id: "c2",
                    operator: "BETWEEN",
                    value: { kind: "literalRange", from: 1, to: 2 },
                    format: { color: "#000000", scope: "row" },
                },
            ],
        },
        {
            id: "r2",
            target: { kind: "attribute", attributeIdentifier: "a1" },
            conditions: [
                {
                    id: "c3",
                    operator: "IS_EMPTY",
                    value: { kind: "none" },
                    format: { backgroundColor: "#EEEEEE", scope: "cell" },
                },
                {
                    id: "c4",
                    operator: "LESS_THAN",
                    value: { kind: "absoluteDate", from: "2023-01-01", to: "2023-12-31" },
                    format: { color: "#111111", scope: "cell" },
                },
                {
                    id: "c5",
                    operator: "GREATER_THAN",
                    value: { kind: "relativeDate", granularity: "GDC.time.year", from: -1, to: -1 },
                    format: { color: "#222222", scope: "cell" },
                },
            ],
        },
    ],
};

describe("convertConditionalFormatting", () => {
    it("returns null when the insight has no conditional formatting", () => {
        expect(convertConditionalFormatting(insightWith(undefined))).toBeNull();
    });

    it("returns null for a malformed blob instead of throwing (content stays authoritative)", () => {
        expect(convertConditionalFormatting(insightWith({ enabled: true }))).toBeNull();
        expect(convertConditionalFormatting(insightWith({ enabled: true, rules: "nope" }))).toBeNull();
        expect(
            convertConditionalFormatting(insightWith({ enabled: true, rules: [{ id: "r1" }] })),
        ).toBeNull();
        expect(
            convertConditionalFormatting(
                insightWith({ enabled: true, rules: [{ id: "r1", conditions: [null] }] }),
            ),
        ).toBeNull();
        expect(
            convertConditionalFormatting(
                insightWith({ enabled: true, rules: [{ id: "r1", conditions: ["nope"] }] }),
            ),
        ).toBeNull();
    });

    it("returns null for a relative-date granularity tiger does not model", () => {
        expect(
            convertConditionalFormatting(
                insightWith({
                    enabled: true,
                    rules: [
                        {
                            id: "r1",
                            target: { kind: "measure", measureIdentifier: "m1" },
                            conditions: [
                                {
                                    id: "c1",
                                    operator: "GREATER_THAN",
                                    value: {
                                        kind: "relativeDate",
                                        granularity: "GDC.time.euweek_in_year",
                                        from: -1,
                                        to: -1,
                                    },
                                    format: { color: "#222222", scope: "cell" },
                                },
                            ],
                        },
                    ],
                }),
            ),
        ).toBeNull();
    });

    it("carries the disabled toggle through", () => {
        expect(convertConditionalFormatting(insightWith({ enabled: false, rules: [] }))).toEqual({
            enabled: false,
            rules: [],
        });
    });

    it("projects rules, translates relative-date granularity to the tiger vocabulary, and drops version + suppressedTargets", () => {
        const out = convertConditionalFormatting(insightWith(maximal));

        expect(out).toEqual({
            enabled: true,
            rules: [
                {
                    id: "r1",
                    target: { kind: "measure", measureIdentifier: "m1" },
                    conditions: [
                        {
                            id: "c1",
                            operator: "GREATER_THAN",
                            value: { kind: "literal", value: 100 },
                            format: { backgroundColor: "#3DB36B", scope: "cell" },
                        },
                        {
                            id: "c2",
                            operator: "BETWEEN",
                            value: { kind: "literalRange", from: 1, to: 2 },
                            format: { color: "#000000", scope: "row" },
                        },
                    ],
                },
                {
                    id: "r2",
                    target: { kind: "attribute", attributeIdentifier: "a1" },
                    conditions: [
                        {
                            id: "c3",
                            operator: "IS_EMPTY",
                            value: { kind: "none" },
                            format: { backgroundColor: "#EEEEEE", scope: "cell" },
                        },
                        {
                            id: "c4",
                            operator: "LESS_THAN",
                            value: { kind: "absoluteDate", from: "2023-01-01", to: "2023-12-31" },
                            format: { color: "#111111", scope: "cell" },
                        },
                        {
                            id: "c5",
                            operator: "GREATER_THAN",
                            value: { kind: "relativeDate", granularity: "YEAR", from: -1, to: -1 },
                            format: { color: "#222222", scope: "cell" },
                        },
                    ],
                },
            ],
        });

        // The drop-list is deliberate. What guards it: toEqual above fails if the projection starts
        // carrying a new field, and the typed `maximal` literal breaks compilation if
        // IConditionalFormatting gains a required field. A new OPTIONAL model field surfaces nowhere
        // automatically — extend `maximal` and decide its fate here when the model grows.
        expect(out).not.toHaveProperty("version");
        expect(out).not.toHaveProperty("suppressedTargets");
    });
});

function baseCondition(overrides: Partial<IConditionalFormattingCondition>): IConditionalFormattingCondition {
    return {
        id: "c1",
        operator: "ALL",
        value: { kind: "none" },
        format: { backgroundColor: "#E54D40", scope: "cell" },
        ...overrides,
    };
}

function cfWith(conditions: IConditionalFormattingCondition[]): IConditionalFormatting {
    return {
        enabled: true,
        rules: [{ id: "r1", target: { kind: "measure", measureIdentifier: "m1" }, conditions }],
    };
}

describe("convertConditionalFormattingToBackend", () => {
    it("passes rule id and target through unchanged", () => {
        const result = convertConditionalFormattingToBackend(cfWith([baseCondition({})]));

        expect(result.rules[0].id).toBe("r1");
        expect(result.rules[0].target).toEqual({ kind: "measure", measureIdentifier: "m1" });
    });

    it("passes condition id and format through unchanged", () => {
        const result = convertConditionalFormattingToBackend(cfWith([baseCondition({})]));

        expect(result.rules[0].conditions[0].id).toBe("c1");
        expect(result.rules[0].conditions[0].format).toEqual({ backgroundColor: "#E54D40", scope: "cell" });
    });

    it.each(["ALL", "GREATER_THAN", "BETWEEN", "CONTAINS", "IS_EMPTY"] as const)(
        "passes the %s operator through unchanged",
        (operator) => {
            const result = convertConditionalFormattingToBackend(cfWith([baseCondition({ operator })]));

            expect(result.rules[0].conditions[0].operator).toBe(operator);
        },
    );

    it("passes a none value through unchanged", () => {
        const result = convertConditionalFormattingToBackend(
            cfWith([baseCondition({ value: { kind: "none" } })]),
        );

        expect(result.rules[0].conditions[0].value).toEqual({ kind: "none" });
    });

    it("passes a literal value through unchanged", () => {
        const result = convertConditionalFormattingToBackend(
            cfWith([baseCondition({ value: { kind: "literal", value: "Critical" } })]),
        );

        expect(result.rules[0].conditions[0].value).toEqual({ kind: "literal", value: "Critical" });
    });

    it("passes a literalRange value through unchanged", () => {
        const result = convertConditionalFormattingToBackend(
            cfWith([baseCondition({ value: { kind: "literalRange", from: 1, to: 10 } })]),
        );

        expect(result.rules[0].conditions[0].value).toEqual({ kind: "literalRange", from: 1, to: 10 });
    });

    it("passes an absoluteDate value through unchanged", () => {
        const result = convertConditionalFormattingToBackend(
            cfWith([
                baseCondition({ value: { kind: "absoluteDate", from: "2026-01-01", to: "2026-01-31" } }),
            ]),
        );

        expect(result.rules[0].conditions[0].value).toEqual({
            kind: "absoluteDate",
            from: "2026-01-01",
            to: "2026-01-31",
        });
    });

    it("remaps a relativeDate value's granularity to the Tiger wire enum", () => {
        const result = convertConditionalFormattingToBackend(
            cfWith([
                baseCondition({
                    value: { kind: "relativeDate", granularity: "GDC.time.fiscal_quarter", from: -1, to: 0 },
                }),
            ]),
        );

        expect(result.rules[0].conditions[0].value).toEqual({
            kind: "relativeDate",
            granularity: "FISCAL_QUARTER",
            from: -1,
            to: 0,
        });
    });

    it("drops the version field — it has no wire counterpart", () => {
        const result = convertConditionalFormattingToBackend({
            version: "1",
            enabled: true,
            rules: [],
        });

        expect(result).not.toHaveProperty("version");
    });

    it("passes enabled: false through unchanged", () => {
        const result = convertConditionalFormattingToBackend({ enabled: false, rules: [] });

        expect(result.enabled).toBe(false);
    });
});
