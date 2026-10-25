// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IRawBucketItem, type IRawBuckets } from "../../typings/buckets.js";

import {
    addBucketItemsInBuckets,
    changeMeasureChartTypeInBuckets,
    getBucketLocalIdentifierInBuckets,
    removeSingleBucketItemInBuckets,
    renameBucketItemInBuckets,
    setBucketItemFormatInBuckets,
    setBucketItemShowAllValuesInBuckets,
    setRelatedBucketItemsPropertyInBuckets,
    swapBucketItemInBuckets,
    toggleDualAxisInBuckets,
} from "./buckets_write_helpers.js";

/**
 * The ITEM WRITERS. What is worth pinning here is not that an item lands in a bucket — the suites in
 * `services/test/buckets_service.test.ts` cover that through the whole-root entry points — but four
 * behaviors that are easy to "clean up" by accident:
 *
 * - IDENTITY on a no-op, which is what makes the adapter's `setIn` a no-op in turn;
 * - the multi-item insert at a fixed POSITION reversing the order;
 * - the swap resolving BOTH paths against the original buckets, so a same-bucket swap sees shifted
 *   indices after the delete;
 * - the `accepts` rule deciding whether the source slot is filled or deleted.
 */

const measure = (localIdentifier: string, extra: Partial<IRawBucketItem> = {}): IRawBucketItem => ({
    localIdentifier,
    type: "metric",
    ...extra,
});

const attribute = (localIdentifier: string): IRawBucketItem => ({
    localIdentifier,
    type: "attribute",
});

const buckets = (): IRawBuckets => [
    { localIdentifier: "measures", items: [measure("m1"), measure("m2")] },
    { localIdentifier: "view", items: [attribute("a1")] },
];

const itemIdentifiersOf = (value: IRawBuckets, bucketLocalIdentifier: string): string[] =>
    value
        .find((bucket) => bucket.localIdentifier === bucketLocalIdentifier)
        .items.map((item) => item.localIdentifier);

const acceptsEverything = { acceptsItemType: () => true, secondaryAxisEnabled: false };
const acceptsNothing = { acceptsItemType: () => false, secondaryAxisEnabled: false };

describe("addBucketItemsInBuckets", () => {
    it("appends to the end when no position is given", () => {
        const result = addBucketItemsInBuckets(buckets(), "measures", [measure("m3")]);

        expect(itemIdentifiersOf(result, "measures")).toEqual(["m1", "m2", "m3"]);
    });

    it("inserts at the given position", () => {
        const result = addBucketItemsInBuckets(buckets(), "measures", [measure("m3")], 1);

        expect(itemIdentifiersOf(result, "measures")).toEqual(["m1", "m3", "m2"]);
    });

    it("REVERSES a multi-item insert at a fixed position, because every item goes to the same index", () => {
        // kept deliberately: the only production caller inserts exactly one item, and "add these
        // three at index 1" has no other defined meaning here
        const result = addBucketItemsInBuckets(
            buckets(),
            "measures",
            [measure("x"), measure("y"), measure("z")],
            1,
        );

        expect(itemIdentifiersOf(result, "measures")).toEqual(["m1", "z", "y", "x", "m2"]);
    });

    it("appends a multi-item add in order", () => {
        const result = addBucketItemsInBuckets(buckets(), "measures", [measure("x"), measure("y")]);

        expect(itemIdentifiersOf(result, "measures")).toEqual(["m1", "m2", "x", "y"]);
    });

    it("leaves the other buckets untouched BY REFERENCE", () => {
        const value = buckets();
        const result = addBucketItemsInBuckets(value, "measures", [measure("m3")]);

        expect(result[1]).toBe(value[1]);
    });

    it("answers the same buckets for an empty item list", () => {
        const value = buckets();

        expect(addBucketItemsInBuckets(value, "measures", [])).toBe(value);
    });
});

describe("removeSingleBucketItemInBuckets", () => {
    it("removes the item wherever it sits", () => {
        const result = removeSingleBucketItemInBuckets(buckets(), "m1");

        expect(itemIdentifiersOf(result, "measures")).toEqual(["m2"]);
        expect(itemIdentifiersOf(result, "view")).toEqual(["a1"]);
    });

    it("answers the SAME buckets for an identifier that is in no bucket", () => {
        const value = buckets();

        expect(removeSingleBucketItemInBuckets(value, "nope")).toBe(value);
    });

    it("is safe to fold over identifiers already removed", () => {
        const once = removeSingleBucketItemInBuckets(buckets(), "m1");
        const twice = removeSingleBucketItemInBuckets(once, "m1");

        expect(twice).toBe(once);
    });
});

describe("getBucketLocalIdentifierInBuckets", () => {
    it("answers the bucket the item sits in", () => {
        expect(getBucketLocalIdentifierInBuckets(buckets(), measure("m2"))).toBe("measures");
        expect(getBucketLocalIdentifierInBuckets(buckets(), attribute("a1"))).toBe("view");
    });
});

describe("swapBucketItemInBuckets — moving into a target bucket", () => {
    it("removes the item from its bucket and adds it to the target", () => {
        const result = swapBucketItemInBuckets(buckets(), measure("m1"), null, "view", acceptsEverything);

        expect(itemIdentifiersOf(result, "measures")).toEqual(["m2"]);
        expect(itemIdentifiersOf(result, "view")).toEqual(["a1", "m1"]);
    });

    it("stamps the target bucket's secondary-axis setting onto the moved MEASURE", () => {
        const result = swapBucketItemInBuckets(buckets(), measure("m1"), null, "view", {
            acceptsItemType: () => true,
            secondaryAxisEnabled: true,
        });

        expect(itemIdentifiersOf(result, "view")).toEqual(["a1", "m1"]);
        expect(result[1].items[1].showOnSecondaryAxis).toBe(true);
    });

    it("does NOT stamp it onto a moved attribute — enableSecondaryAxis only touches measures", () => {
        const result = swapBucketItemInBuckets(buckets(), attribute("a1"), null, "measures", {
            acceptsItemType: () => true,
            secondaryAxisEnabled: true,
        });

        const moved = result[0].items[2];
        expect(moved.localIdentifier).toBe("a1");
        expect(moved.showOnSecondaryAxis).toBeUndefined();
    });
});

describe("swapBucketItemInBuckets — swapping two items in place", () => {
    it("puts each item in the other's slot when the source bucket accepts the incoming type", () => {
        const result = swapBucketItemInBuckets(
            buckets(),
            measure("m1"),
            attribute("a1"),
            undefined,
            acceptsEverything,
        );

        expect(itemIdentifiersOf(result, "measures")).toEqual(["a1", "m2"]);
        expect(itemIdentifiersOf(result, "view")).toEqual(["m1"]);
    });

    it("DELETES the source slot instead of filling it when the source bucket refuses the type", () => {
        const result = swapBucketItemInBuckets(
            buckets(),
            measure("m1"),
            attribute("a1"),
            undefined,
            acceptsNothing,
        );

        expect(itemIdentifiersOf(result, "measures")).toEqual(["m2"]);
        expect(itemIdentifiersOf(result, "view")).toEqual(["m1"]);
    });

    it("asks the accepts rule about the SOURCE bucket and the TARGET item's type", () => {
        const asked: Array<[string, string]> = [];
        swapBucketItemInBuckets(buckets(), measure("m1"), attribute("a1"), undefined, {
            acceptsItemType: (bucketLocalIdentifier: string, itemType: string) => {
                asked.push([bucketLocalIdentifier, itemType]);
                return true;
            },
            secondaryAxisEnabled: false,
        });

        expect(asked).toEqual([["measures", "attribute"]]);
    });

    it("resolves both paths against the ORIGINAL buckets, so a refused same-bucket swap shifts indices", () => {
        // m1 at index 0 and m2 at index 1 of the same bucket. The refusal deletes index 0 first, which
        // moves m2 down to index 0 — and the second write still targets the pre-computed index 1.
        // Legacy behavior; pinned so a later "fix" has to be a deliberate one.
        const result = swapBucketItemInBuckets(
            buckets(),
            measure("m1"),
            measure("m2"),
            undefined,
            acceptsNothing,
        );

        expect(itemIdentifiersOf(result, "measures")).toEqual(["m2", "m1"]);
    });
});

/**
 * THE NO-OP IDENTITY OF THE NAMED EDITS — the invariant asserted where it actually matters, on the
 * operations the slice dispatches rather than on a generic setter. Every one of these runs on a path
 * that can fire per render, so an edit that writes the value already there must answer the SAME
 * buckets by reference.
 */
describe("no-op identity of the bucket item edits", () => {
    const seeded = (): IRawBuckets => [
        {
            localIdentifier: "measures",
            chartType: "column",
            items: [
                measure("m1", { format: "#,##0", alias: "Revenue", showAllValues: true }),
                measure("m2", { masterLocalIdentifier: "m1" }),
            ],
        },
        { localIdentifier: "view", items: [attribute("a1")] },
    ];

    it("setBucketItemFormatInBuckets answers the SAME buckets for the format already set", () => {
        const value = seeded();

        expect(setBucketItemFormatInBuckets(value, "m1", "#,##0")).toBe(value);
    });

    it("renameBucketItemInBuckets answers the SAME buckets for the alias already set", () => {
        const value = seeded();

        expect(renameBucketItemInBuckets(value, "m1", "Revenue")).toBe(value);
    });

    it("renameBucketItemInBuckets answers the SAME buckets when clearing an absent alias", () => {
        const value = seeded();

        expect(renameBucketItemInBuckets(value, "m2", "")).toBe(value);
    });

    it("setBucketItemShowAllValuesInBuckets answers the SAME buckets for the flag already set", () => {
        const value = seeded();

        expect(setBucketItemShowAllValuesInBuckets(value, "m1", true)).toBe(value);
    });

    it("changeMeasureChartTypeInBuckets answers the SAME buckets for the chart type already set", () => {
        const value = seeded();

        expect(changeMeasureChartTypeInBuckets(value, "measures", "column")).toBe(value);
    });

    it("setRelatedBucketItemsPropertyInBuckets answers the SAME buckets when the flag is already set", () => {
        const value = setRelatedBucketItemsPropertyInBuckets(seeded(), "isTotalMeasure", "m1", true);

        expect(setRelatedBucketItemsPropertyInBuckets(value, "isTotalMeasure", "m1", true)).toBe(value);
    });

    it("toggleDualAxisInBuckets answers the SAME buckets when every item already carries the value", () => {
        const value = toggleDualAxisInBuckets(seeded(), "measures", true);

        expect(toggleDualAxisInBuckets(value, "measures", true)).toBe(value);
    });

    it("removeSingleBucketItemInBuckets answers the SAME buckets for an item in no bucket", () => {
        const value = seeded();

        expect(removeSingleBucketItemInBuckets(value, "not-in-any-bucket")).toBe(value);
    });
});

describe("structural sharing of the bucket item edits", () => {
    const seeded = (): IRawBuckets => [
        {
            localIdentifier: "measures",
            items: [measure("m1", { format: "#,##0" }), measure("m2", { format: "0.00" })],
        },
        { localIdentifier: "view", items: [attribute("a1")] },
    ];

    it("a format edit copies ONLY the addressed path", () => {
        const value = seeded();
        const untouchedBucket = value[1];
        const untouchedItem = value[0].items[1];

        const result = setBucketItemFormatInBuckets(value, "m1", "0.0%");

        expect(result).not.toBe(value);
        expect(result[0]).not.toBe(value[0]);
        expect(result[0].items).not.toBe(value[0].items);
        expect(result[0].items[0]).not.toBe(value[0].items[0]);

        expect(result[1]).toBe(untouchedBucket);
        expect(result[0].items[1]).toBe(untouchedItem);
    });

    it("the related-flag edit leaves the other bucket alone", () => {
        const value = seeded();
        const untouchedBucket = value[1];

        const result = setRelatedBucketItemsPropertyInBuckets(value, "showInPercent", "m1", true);

        expect(result).not.toBe(value);
        expect(result[1]).toBe(untouchedBucket);
    });
});
