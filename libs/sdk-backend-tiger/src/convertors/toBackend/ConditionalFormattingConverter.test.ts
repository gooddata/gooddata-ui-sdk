// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IConditionalFormatting, type IInsight, uriRef } from "@gooddata/sdk-model";

import { convertConditionalFormatting } from "./ConditionalFormattingConverter.js";

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
// fields the projection deliberately drops (version, customTargets).
const maximal: IConditionalFormatting = {
    version: "1",
    enabled: true,
    customTargets: [{ kind: "attribute", attributeIdentifier: "a1" }],
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

    it("projects rules, translates relative-date granularity to the tiger vocabulary, and drops version + customTargets", () => {
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
        expect(out).not.toHaveProperty("customTargets");
    });
});
