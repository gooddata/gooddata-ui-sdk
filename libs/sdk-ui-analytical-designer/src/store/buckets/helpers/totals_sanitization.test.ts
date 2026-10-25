// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type ITotal, type TotalType } from "@gooddata/sdk-model";

import { type IBucketItem } from "../../../typings/metadata.js";

import { reorderTotalsByMeasures, sanitizeBucketTotals } from "./totals_sanitization.js";

const attribute = (localIdentifier: string): IBucketItem =>
    ({ localIdentifier, type: "attribute" }) as IBucketItem;

const measure = (localIdentifier: string): IBucketItem =>
    ({ localIdentifier, type: "metric" }) as IBucketItem;

const total = (measureIdentifier: string, attributeIdentifier: string, type: TotalType = "sum"): ITotal => ({
    measureIdentifier,
    attributeIdentifier,
    type,
});

describe("sanitizeBucketTotals", () => {
    const measures = [measure("m1"), measure("m2")];

    it("drops totals whose measure is no longer in the buckets", () => {
        const totals = [total("m1", "a1"), total("gone", "a1")];

        expect(sanitizeBucketTotals(totals, [attribute("a1")], [attribute("a1")], measures, false)).toEqual([
            total("m1", "a1"),
        ]);
    });

    it("keeps a grand total attached to whichever attribute is now first", () => {
        const totals = [total("m1", "a1")];
        const previousAttributes = [attribute("a1"), attribute("a2")];
        const attributes = [attribute("a2"), attribute("a1")];

        // a1 WAS the first attribute (grand total); a2 is first now, so the total follows a2
        expect(sanitizeBucketTotals(totals, attributes, previousAttributes, measures, false)).toEqual([
            total("m1", "a2"),
        ]);
    });

    it("leaves a grand total alone when its attribute is still the first one", () => {
        const totals = [total("m1", "a1")];
        const attributes = [attribute("a1"), attribute("a2")];

        expect(sanitizeBucketTotals(totals, attributes, attributes, measures, false)).toEqual([
            total("m1", "a1"),
        ]);
    });

    it("drops a subtotal whose 'within' attribute left the bucket", () => {
        // a2 is a subtotal within a1; removing a1 leaves the subtotal without its anchor
        const totals = [total("m1", "a2")];
        const previousAttributes = [attribute("a1"), attribute("a2")];
        const attributes = [attribute("a2")];

        expect(sanitizeBucketTotals(totals, attributes, previousAttributes, measures, false)).toEqual([]);
    });

    it("drops a subtotal whose 'within' attribute became the last one", () => {
        const totals = [total("m1", "a2")];
        const previousAttributes = [attribute("a1"), attribute("a2")];
        const attributes = [attribute("a2"), attribute("a1")];

        expect(sanitizeBucketTotals(totals, attributes, previousAttributes, measures, false)).toEqual([]);
    });

    it("re-points a subtotal at the attribute that now follows its 'within' attribute", () => {
        // a2 is a subtotal within a1; inserting a3 between them moves the subtotal onto a3
        const totals = [total("m1", "a2")];
        const previousAttributes = [attribute("a1"), attribute("a2")];
        const attributes = [attribute("a1"), attribute("a3"), attribute("a2")];

        expect(sanitizeBucketTotals(totals, attributes, previousAttributes, measures, false)).toEqual([
            total("m1", "a3"),
        ]);
    });

    it("keeps a subtotal whose 'within' attribute did not change", () => {
        const totals = [total("m1", "a2")];
        const attributes = [attribute("a1"), attribute("a2"), attribute("a3")];

        expect(sanitizeBucketTotals(totals, attributes, attributes, measures, false)).toEqual([
            total("m1", "a2"),
        ]);
    });

    it("passes a total through untouched when there is no attribute history", () => {
        const totals = [total("m1", "a1")];

        expect(sanitizeBucketTotals(totals, [attribute("a2")], [], measures, false)).toEqual([
            total("m1", "a1"),
        ]);
    });

    it("answers empty for an empty totals list", () => {
        expect(sanitizeBucketTotals([], [attribute("a1")], [attribute("a1")], measures, true)).toEqual([]);
    });

    it("reorders same-function totals by measure position only when asked to", () => {
        const totals = [total("m2", "a1"), total("m1", "a1")];
        const attributes = [attribute("a1")];

        expect(sanitizeBucketTotals(totals, attributes, attributes, measures, true)).toEqual([
            total("m1", "a1"),
            total("m2", "a1"),
        ]);
        expect(sanitizeBucketTotals(totals, attributes, attributes, measures, false)).toEqual([
            total("m2", "a1"),
            total("m1", "a1"),
        ]);
    });

    it("does not mutate the totals list it was given", () => {
        const totals = [total("m2", "a1"), total("m1", "a1")];
        const attributes = [attribute("a1")];

        sanitizeBucketTotals(totals, attributes, attributes, measures, true);

        expect(totals).toEqual([total("m2", "a1"), total("m1", "a1")]);
    });
});

describe("reorderTotalsByMeasures", () => {
    const measures = [measure("m1"), measure("m2"), measure("m3")];

    it("orders totals of the same function by measure position", () => {
        const totals = [total("m3", "a1"), total("m1", "a1"), total("m2", "a1")];

        expect(reorderTotalsByMeasures(totals, measures)).toEqual([
            total("m1", "a1"),
            total("m2", "a1"),
            total("m3", "a1"),
        ]);
    });

    it("preserves the order in which the aggregate functions first appear", () => {
        const totals = [
            total("m2", "a1", "max"),
            total("m2", "a1", "sum"),
            total("m1", "a1", "max"),
            total("m1", "a1", "sum"),
        ];

        // max was seen first, so the max group stays first - only its members get reordered
        expect(reorderTotalsByMeasures(totals, measures)).toEqual([
            total("m1", "a1", "max"),
            total("m2", "a1", "max"),
            total("m1", "a1", "sum"),
            total("m2", "a1", "sum"),
        ]);
    });

    it("sorts a total for an unknown measure to the front, because findIndex answers -1", () => {
        const totals = [total("m1", "a1"), total("unknown", "a1")];

        expect(reorderTotalsByMeasures(totals, measures)).toEqual([
            total("unknown", "a1"),
            total("m1", "a1"),
        ]);
    });

    it.each([
        ["no totals", [], measures],
        ["no measures", [total("m1", "a1")], []],
    ])("returns the totals as they came in when there are %s", (_name: string, totals: ITotal[], ms) => {
        expect(reorderTotalsByMeasures(totals, ms)).toBe(totals);
    });
});
