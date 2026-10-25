// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type ITotal } from "@gooddata/sdk-model";

import { ATTRIBUTE, COLUMNS, MEASURES, METRIC } from "../../constants/bucket.js";
import { type IRawBucketItem, type IRawBuckets } from "../../typings/buckets.js";

import {
    addTotalsEnabledForAllMeasuresToNewMeasure,
    areBucketTotalsIdentical,
    mirrorTotalsToDerivedMeasures,
    replaceDerivedTotalItems,
    sanitizeTotals,
    setBucketTotals,
} from "./buckets_totals_helpers.js";

/**
 * Unit suite for the value-level totals helpers. Two things here are easy to lose silently: the
 * IDENTITY guards (a helper answering its own input is how a no-op is expressed) and
 * `sanitizeTotals`' TWO buckets values (dropping the previous one breaks the re-pointing table
 * without failing any value assertion). So the assertions are `toBe`, not `toEqual`, wherever
 * identity is the contract.
 */

const measure = (localIdentifier: string, extra: Partial<IRawBucketItem> = {}): IRawBucketItem => ({
    localIdentifier,
    type: METRIC,
    ...extra,
});

const attribute = (localIdentifier: string): IRawBucketItem => ({
    localIdentifier,
    type: "attribute",
});

const total = (measureIdentifier: string, attributeIdentifier: string, type = "sum"): ITotal => ({
    measureIdentifier,
    attributeIdentifier,
    type: type as ITotal["type"],
});

function buckets({
    measures = [measure("m1")],
    rowAttributes = [attribute("a1")],
    rowTotals,
    colAttributes = [],
    colTotals,
}: {
    measures?: IRawBucketItem[];
    rowAttributes?: IRawBucketItem[];
    rowTotals?: ITotal[];
    colAttributes?: IRawBucketItem[];
    colTotals?: ITotal[];
} = {}): IRawBuckets {
    return [
        { localIdentifier: MEASURES, items: measures },
        {
            localIdentifier: ATTRIBUTE,
            items: rowAttributes,
            ...(rowTotals ? { totals: rowTotals } : {}),
        },
        {
            localIdentifier: COLUMNS,
            items: colAttributes,
            ...(colTotals ? { totals: colTotals } : {}),
        },
    ];
}

describe("areBucketTotalsIdentical", () => {
    it("is true for a deep-equal totals list", () => {
        const value = buckets({ rowTotals: [total("m1", "a1")] });

        expect(areBucketTotalsIdentical(value, [total("m1", "a1")], ATTRIBUTE)).toBe(true);
    });

    it("is false when the totals differ", () => {
        const value = buckets({ rowTotals: [total("m1", "a1")] });

        expect(areBucketTotalsIdentical(value, [total("m1", "a1", "max")], ATTRIBUTE)).toBe(false);
    });

    it("is false for a bucket that does not exist — the case identity alone cannot express", () => {
        // this is why the adapter asks the predicate instead of comparing references: nothing changes
        // in the buckets either way, but the reference point still has to be re-synced here
        expect(areBucketTotalsIdentical(buckets(), [total("m1", "a1")], "no.such.bucket")).toBe(false);
    });
});

describe("setBucketTotals", () => {
    it("replaces the addressed bucket's totals", () => {
        const value = buckets({ rowTotals: [total("m1", "a1")] });

        const result = setBucketTotals(value, [total("m1", "a1", "max")], ATTRIBUTE);

        expect(result[1].totals).toEqual([total("m1", "a1", "max")]);
    });

    it("keeps IDENTITY when the totals are deep-equal", () => {
        const value = buckets({ rowTotals: [total("m1", "a1")] });

        expect(setBucketTotals(value, [total("m1", "a1")], ATTRIBUTE)).toBe(value);
    });

    it("keeps IDENTITY for a falsy payload", () => {
        const value = buckets({ rowTotals: [total("m1", "a1")] });

        expect(setBucketTotals(value, undefined, ATTRIBUTE)).toBe(value);
    });

    it("leaves the other buckets by reference", () => {
        const value = buckets({ rowTotals: [total("m1", "a1")] });

        const result = setBucketTotals(value, [total("m1", "a1", "max")], ATTRIBUTE);

        expect(result[0]).toBe(value[0]);
        expect(result[2]).toBe(value[2]);
    });
});

describe("sanitizeTotals", () => {
    it("drops the row totals when the row attributes are gone", () => {
        const previous = buckets({ rowAttributes: [attribute("a1")], rowTotals: [total("m1", "a1")] });
        const current = buckets({ rowAttributes: [], rowTotals: [total("m1", "a1")] });

        const result = sanitizeTotals(previous, current, { reorderByMeasures: false });

        expect(result[1].totals).toBeUndefined();
    });

    it("drops the row totals when there are no measures left", () => {
        const previous = buckets({ rowTotals: [total("m1", "a1")] });
        const current = buckets({ measures: [], rowTotals: [total("m1", "a1")] });

        const result = sanitizeTotals(previous, current, { reorderByMeasures: false });

        expect(result[1].totals).toBeUndefined();
    });

    it("drops a total whose measure no longer exists", () => {
        const previous = buckets({
            measures: [measure("m1"), measure("m2")],
            rowTotals: [total("m1", "a1"), total("m2", "a1")],
        });
        const current = buckets({
            measures: [measure("m1")],
            rowTotals: [total("m1", "a1"), total("m2", "a1")],
        });

        const result = sanitizeTotals(previous, current, { reorderByMeasures: false });

        expect(result[1].totals).toEqual([total("m1", "a1")]);
    });

    /**
     * The PREVIOUS buckets are load-bearing here and nowhere else: a grand total is identified by
     * sitting on the FIRST attribute of its bucket, so re-pointing it after a reorder is only
     * answerable by comparing before with after. A one-parameter conversion of this helper would keep
     * every other spec in this file green.
     */
    it("re-points a grand total at the new first attribute after a reorder", () => {
        const previous = buckets({
            rowAttributes: [attribute("a1"), attribute("a2")],
            rowTotals: [total("m1", "a1")],
        });
        const current = buckets({
            rowAttributes: [attribute("a2"), attribute("a1")],
            rowTotals: [total("m1", "a1")],
        });

        const result = sanitizeTotals(previous, current, { reorderByMeasures: false });

        expect(result[1].totals).toEqual([total("m1", "a2")]);
    });

    it("keeps the grand total where it is when the first attribute did not move", () => {
        const value = buckets({
            rowAttributes: [attribute("a1"), attribute("a2")],
            rowTotals: [total("m1", "a1")],
        });

        const result = sanitizeTotals(value, value, { reorderByMeasures: false });

        expect(result[1].totals).toEqual([total("m1", "a1")]);
    });

    it("reorders totals by measure order only when asked", () => {
        const value = buckets({
            measures: [measure("m1"), measure("m2")],
            rowAttributes: [attribute("a1")],
            rowTotals: [total("m2", "a1"), total("m1", "a1")],
        });

        expect(sanitizeTotals(value, value, { reorderByMeasures: false })[1].totals).toEqual([
            total("m2", "a1"),
            total("m1", "a1"),
        ]);
        expect(sanitizeTotals(value, value, { reorderByMeasures: true })[1].totals).toEqual([
            total("m1", "a1"),
            total("m2", "a1"),
        ]);
    });

    it("sanitizes the column bucket independently of the row bucket", () => {
        const previous = buckets({
            rowTotals: [total("m1", "a1")],
            colAttributes: [attribute("c1")],
            colTotals: [total("m1", "c1")],
        });
        const current = buckets({
            rowTotals: [total("m1", "a1")],
            colAttributes: [],
            colTotals: [total("m1", "c1")],
        });

        const result = sanitizeTotals(previous, current, { reorderByMeasures: false });

        expect(result[1].totals).toEqual([total("m1", "a1")]);
        expect(result[2].totals).toBeUndefined();
    });
});

describe("mirrorTotalsToDerivedMeasures", () => {
    it("copies a master's total onto the measure derived from it", () => {
        const master = measure("m1");
        const derived = measure("m1_derived", { masterLocalIdentifier: "m1" });
        const value = buckets({ measures: [master, derived], rowTotals: [total("m1", "a1")] });

        const result = mirrorTotalsToDerivedMeasures(value, master);

        expect(result[1].totals).toEqual([total("m1_derived", "a1"), total("m1", "a1")]);
    });

    it("keeps IDENTITY when there is no derived measure to mirror onto", () => {
        const master = measure("m1");
        const value = buckets({ measures: [master], rowTotals: [total("m1", "a1")] });

        expect(mirrorTotalsToDerivedMeasures(value, master)).toBe(value);
    });

    it("keeps IDENTITY when no bucket carries totals", () => {
        const master = measure("m1");
        const value = buckets({ measures: [master, measure("m1_d", { masterLocalIdentifier: "m1" })] });

        expect(mirrorTotalsToDerivedMeasures(value, master)).toBe(value);
    });

    it("keeps IDENTITY when the totals target a different measure", () => {
        const master = measure("m1");
        const value = buckets({
            measures: [master, measure("m1_d", { masterLocalIdentifier: "m1" }), measure("m2")],
            rowTotals: [total("m2", "a1")],
        });

        expect(mirrorTotalsToDerivedMeasures(value, master)).toBe(value);
    });
});

describe("addTotalsEnabledForAllMeasuresToNewMeasure", () => {
    it("gives the new measure a total the existing measures all have", () => {
        const value = buckets({
            measures: [measure("m1"), measure("m2"), measure("new")],
            rowTotals: [total("m1", "a1"), total("m2", "a1")],
        });

        const result = addTotalsEnabledForAllMeasuresToNewMeasure(value, measure("new"));

        expect(result[1].totals).toEqual([total("m1", "a1"), total("m2", "a1"), total("new", "a1")]);
    });

    it("keeps IDENTITY when the total is not enabled on every other measure", () => {
        const value = buckets({
            measures: [measure("m1"), measure("m2"), measure("new")],
            rowTotals: [total("m1", "a1")],
        });

        expect(addTotalsEnabledForAllMeasuresToNewMeasure(value, measure("new"))).toBe(value);
    });

    it("keeps IDENTITY when no bucket has totals", () => {
        const value = buckets({ measures: [measure("m1"), measure("new")] });

        expect(addTotalsEnabledForAllMeasuresToNewMeasure(value, measure("new"))).toBe(value);
    });

    it("applies to the row and the column bucket in turn", () => {
        const value = buckets({
            measures: [measure("m1"), measure("new")],
            rowTotals: [total("m1", "a1")],
            colAttributes: [attribute("c1")],
            colTotals: [total("m1", "c1")],
        });

        const result = addTotalsEnabledForAllMeasuresToNewMeasure(value, measure("new"));

        expect(result[1].totals).toEqual([total("m1", "a1"), total("new", "a1")]);
        expect(result[2].totals).toEqual([total("m1", "c1"), total("new", "c1")]);
    });
});

describe("replaceDerivedTotalItems", () => {
    it("re-points every total of the old derived measure at the new one", () => {
        const oldDerived = measure("m1_pop");
        const newDerived = measure("m1_previous_period");
        const value = buckets({ rowTotals: [total("m1_pop", "a1"), total("m1", "a1")] });

        const result = replaceDerivedTotalItems(value, oldDerived, newDerived);

        expect(result[1].totals).toEqual([total("m1_previous_period", "a1"), total("m1", "a1")]);
    });

    it("keeps IDENTITY when no total mentions the old derived measure", () => {
        const value = buckets({ rowTotals: [total("m1", "a1")] });

        expect(replaceDerivedTotalItems(value, measure("m1_pop"), measure("m1_pp"))).toBe(value);
    });

    it("keeps IDENTITY when no bucket carries totals", () => {
        const value = buckets();

        expect(replaceDerivedTotalItems(value, measure("m1_pop"), measure("m1_pp"))).toBe(value);
    });
});
