// (C) 2026 GoodData Corporation

import { invariant } from "ts-invariant";
import { describe, expect, it, vi } from "vitest";

import {
    type ConditionalFormattingCondition,
    type ConditionalFormattingRelativeDateValueGranularityEnum,
} from "@gooddata/api-client-tiger";
import { type DateFilterGranularity, type IConditionalFormattingCondition } from "@gooddata/sdk-model";

import {
    fromTigerConditionalFormatting,
    toTigerConditionalFormatting,
} from "./conditionalFormattingConversions.js";

const literalCondition: IConditionalFormattingCondition = {
    id: "c1",
    operator: "GREATER_THAN",
    value: { kind: "literal", value: 500 },
    format: { color: "#123456", scope: "cell" },
};

const rangeCondition: IConditionalFormattingCondition = {
    id: "c2",
    operator: "BETWEEN",
    value: { kind: "literalRange", from: 1, to: 10 },
    format: { backgroundColor: "#E54D40", scope: "row" },
};

const relativeDateCondition: IConditionalFormattingCondition = {
    id: "c3",
    operator: "EQUAL_TO",
    value: { kind: "relativeDate", granularity: "GDC.time.month", from: -1, to: -1 },
    format: { scope: "cell" },
};

function toWire(...conditions: IConditionalFormattingCondition[]) {
    return toTigerConditionalFormatting({ conditions }).conditions;
}

function fromWire(...conditions: ConditionalFormattingCondition[]) {
    return fromTigerConditionalFormatting({ enabled: true, conditions }).conditions;
}

describe("conditionalFormattingConversions", () => {
    describe("toTigerConditionalFormatting", () => {
        it("defaults an absent enabled to true", () => {
            expect(toTigerConditionalFormatting({ conditions: [literalCondition] }).enabled).toBe(true);
        });

        it("carries an explicit enabled: false", () => {
            expect(
                toTigerConditionalFormatting({ enabled: false, conditions: [literalCondition] }).enabled,
            ).toBe(false);
        });

        it("maps a literal condition field-for-field, id included", () => {
            const [wire] = toWire(literalCondition);
            expect(wire).toEqual({
                id: "c1",
                operator: "GREATER_THAN",
                value: { kind: "literal", value: 500 },
                format: { color: "#123456", scope: "cell" },
            });
        });

        it("maps a range condition field-for-field", () => {
            const [wire] = toWire(rangeCondition);
            expect(wire).toEqual({
                id: "c2",
                operator: "BETWEEN",
                value: { kind: "literalRange", from: 1, to: 10 },
                format: { backgroundColor: "#E54D40", scope: "row" },
            });
        });

        it("translates a relative-date granularity to the wire's UPPER_SNAKE_CASE vocabulary", () => {
            const [wire] = toWire(relativeDateCondition);
            expect(wire.value).toEqual({ kind: "relativeDate", granularity: "MONTH", from: -1, to: -1 });
        });

        it("round-trips a full set of conditions", () => {
            const conditions = [literalCondition, rangeCondition, relativeDateCondition];
            const wire = toTigerConditionalFormatting({ enabled: true, conditions });
            expect(fromTigerConditionalFormatting(wire)).toEqual({ enabled: true, conditions });
        });

        // Pins the exhaustive mapping directly: a symmetric bug (two wire values swapped consistently
        // in both directions) would still pass a round-trip check.
        const granularityPairs: [
            DateFilterGranularity,
            ConditionalFormattingRelativeDateValueGranularityEnum,
        ][] = [
            ["GDC.time.second", "SECOND"],
            ["GDC.time.minute", "MINUTE"],
            ["GDC.time.hour", "HOUR"],
            ["GDC.time.date", "DAY"],
            ["GDC.time.week_us", "WEEK"],
            ["GDC.time.month", "MONTH"],
            ["GDC.time.fiscal_month", "FISCAL_MONTH"],
            ["GDC.time.quarter", "QUARTER"],
            ["GDC.time.fiscal_quarter", "FISCAL_QUARTER"],
            ["GDC.time.year", "YEAR"],
            ["GDC.time.fiscal_year", "FISCAL_YEAR"],
        ];

        it.each(granularityPairs)("maps %s to %s and back", (sdkGranularity, wireGranularity) => {
            const condition: IConditionalFormattingCondition = {
                id: "c6",
                operator: "EQUAL_TO",
                value: { kind: "relativeDate", granularity: sdkGranularity, from: 0, to: 0 },
                format: { scope: "cell" },
            };

            const [wire] = toWire(condition);
            expect(wire.value).toEqual({
                kind: "relativeDate",
                granularity: wireGranularity,
                from: 0,
                to: 0,
            });

            const [roundTripped] = fromWire(wire);
            expect(roundTripped.value).toEqual({
                kind: "relativeDate",
                granularity: sdkGranularity,
                from: 0,
                to: 0,
            });
        });
    });

    describe("fromTigerConditionalFormatting", () => {
        it("carries enabled through unchanged", () => {
            expect(fromTigerConditionalFormatting({ enabled: false, conditions: [] }).enabled).toBe(false);
        });

        it("maps WEEK to week_us (DateFilterGranularity has no plain week)", () => {
            const [condition] = fromWire({
                id: "c5",
                operator: "EQUAL_TO",
                value: { kind: "relativeDate", granularity: "WEEK", from: -2, to: -2 },
                format: { scope: "cell" },
            });
            expect(condition.value).toEqual({
                kind: "relativeDate",
                granularity: "GDC.time.week_us",
                from: -2,
                to: -2,
            });
        });

        it("synthesizes a fresh id for a wire condition missing one", () => {
            const [condition] = fromWire({
                operator: "EQUAL_TO",
                value: { kind: "none" },
                format: { scope: "cell" },
            });
            expect(condition.id).toEqual(expect.any(String));
            expect(condition.id.length).toBeGreaterThan(0);
        });

        it.each([
            "FISCAL_WEEK",
            "FISCAL_DAY_OF_FISCAL_WEEK",
        ] as ConditionalFormattingRelativeDateValueGranularityEnum[])(
            "falls back to GDC.time.date (and warns, without throwing) for the tiger-unsupported granularity %s",
            (granularity) => {
                const warnSpy = vi.spyOn(invariant, "warn").mockImplementation(() => undefined);
                const [condition] = fromWire({
                    id: "c4",
                    operator: "EQUAL_TO",
                    value: { kind: "relativeDate", granularity, from: 0, to: 0 },
                    format: { scope: "cell" },
                });
                expect(condition.value).toEqual({
                    kind: "relativeDate",
                    granularity: "GDC.time.date",
                    from: 0,
                    to: 0,
                });
                expect(warnSpy).toHaveBeenCalledTimes(1);
                warnSpy.mockRestore();
            },
        );

        it.each(["WEEK_OF_YEAR", "DAY_OF_MONTH"] as ConditionalFormattingRelativeDateValueGranularityEnum[])(
            "falls back to GDC.time.date silently for %s, which maps fine but is outside DateFilterGranularity",
            (granularity) => {
                const warnSpy = vi.spyOn(invariant, "warn").mockImplementation(() => undefined);
                const [condition] = fromWire({
                    id: "c4",
                    operator: "EQUAL_TO",
                    value: { kind: "relativeDate", granularity, from: 0, to: 0 },
                    format: { scope: "cell" },
                });
                expect(condition.value).toEqual({
                    kind: "relativeDate",
                    granularity: "GDC.time.date",
                    from: 0,
                    to: 0,
                });
                expect(warnSpy).not.toHaveBeenCalled();
                warnSpy.mockRestore();
            },
        );
    });
});
