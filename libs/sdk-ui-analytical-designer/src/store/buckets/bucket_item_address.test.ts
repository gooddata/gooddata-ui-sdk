// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IRawBucketItem, type IRawBuckets } from "../../typings/buckets.js";

import {
    getBucketItemAddress,
    getBucketItemAt,
    insertBucketItem,
    removeBucketItemAt,
    replaceBucketItemAt,
    requireBucketItemAddress,
    resolveBucketIndexInBuckets,
    updateBucketAt,
    updateBucketItemAt,
    updateBucketItemsAt,
    updateEveryBucket,
    updateEveryBucketItem,
} from "./bucket_item_address.js";

/**
 * THE TWO INVARIANTS THE WHOLE BUCKETS DOMAIN RESTS ON, pinned at the one place that implements them:
 *
 * - a semantic NO-OP answers the ORIGINAL value by reference. That identity is how a buckets operation
 *   says "nothing happened"; the render paths re-derive from `data.buckets`, so a rebuilt subtree on a
 *   same-value write is a render loop;
 * - a real change copies ONLY the containers on the addressed path. Sibling buckets, sibling items and
 *   every untouched field keep their references.
 *
 * Both are asserted with `toBe` (identity), never `toEqual` — a value comparison cannot tell the two
 * apart, which is exactly the mistake these tests exist to catch.
 */

const measure = (localIdentifier: string, format?: string): IRawBucketItem => ({
    localIdentifier,
    type: "metric",
    ...(format === undefined ? {} : { format }),
});

const buckets = (): IRawBuckets => [
    { localIdentifier: "measures", items: [measure("m1", "#,##0"), measure("m2")] },
    { localIdentifier: "view", items: [measure("a1")] },
];

describe("addressing a bucket item", () => {
    it("answers which bucket holds the item and which slot it sits in", () => {
        expect(getBucketItemAddress(buckets(), measure("a1"))).toEqual({ bucketIndex: 1, itemIndex: 0 });
    });

    it("answers undefined for an item that is in no bucket", () => {
        expect(getBucketItemAddress(buckets(), measure("not-there"))).toBeUndefined();
    });

    it("reads the item back at its own address", () => {
        const value = buckets();
        const address = requireBucketItemAddress(value, measure("m2"));

        expect(getBucketItemAt(value, address)).toBe(value[0].items[1]);
    });

    it("THROWS for an item that is in no bucket, which the unguarded edits rely on", () => {
        expect(() => requireBucketItemAddress(buckets(), measure("not-there"))).toThrow(TypeError);
    });

    it("wraps an unknown bucket local identifier onto the LAST bucket", () => {
        // preserved behavior, not an accident: `findIndex` answers -1 and the negative index wraps,
        // so an edit naming a bucket that is not there edits the last one
        expect(resolveBucketIndexInBuckets(buckets(), "no-such-bucket")).toBe(1);
        expect(resolveBucketIndexInBuckets(buckets(), "view")).toBe(1);
    });

    it("leaves the index negative when there is nothing to wrap onto", () => {
        expect(resolveBucketIndexInBuckets([], "no-such-bucket")).toBe(-1);
    });
});

describe("no-op identity", () => {
    it("updateBucketAt answers the original buckets when the updater changes nothing", () => {
        const value = buckets();

        expect(updateBucketAt(value, 0, (bucket) => bucket)).toBe(value);
    });

    it("updateBucketAt answers the original buckets for an index addressing no bucket", () => {
        const value = buckets();

        expect(updateBucketAt(value, -1, () => ({ localIdentifier: "x" }))).toBe(value);
        expect(updateBucketAt(value, 7, () => ({ localIdentifier: "x" }))).toBe(value);
    });

    it("updateEveryBucket answers the original buckets when every bucket maps to itself", () => {
        const value = buckets();

        expect(updateEveryBucket(value, (bucket) => bucket)).toBe(value);
    });

    it("updateEveryBucketItem answers the original bucket AND its items when nothing changed", () => {
        const bucket = buckets()[0];

        const result = updateEveryBucketItem(bucket, (item) => item);

        expect(result).toBe(bucket);
        expect(result.items).toBe(bucket.items);
    });

    it("updateBucketItemAt answers the original buckets when the item is unchanged", () => {
        const value = buckets();

        const result = updateBucketItemAt(value, { bucketIndex: 0, itemIndex: 0 }, (item) =>
            item.format === "#,##0" ? item : { ...item, format: "#,##0" },
        );

        expect(result).toBe(value);
    });

    it("replaceBucketItemAt answers the original buckets when the slot already holds that item", () => {
        const value = buckets();
        const existing = value[0].items[1];

        expect(replaceBucketItemAt(value, { bucketIndex: 0, itemIndex: 1 }, existing)).toBe(value);
    });

    it("removeBucketItemAt answers the original buckets for a slot that is not there", () => {
        const value = buckets();

        expect(removeBucketItemAt(value, { bucketIndex: 0, itemIndex: 9 })).toBe(value);
    });

    it("updateBucketItemsAt answers the original buckets when the same collection comes back", () => {
        const value = buckets();

        expect(updateBucketItemsAt(value, 0, (items) => items!)).toBe(value);
    });
});

describe("structural sharing — only the addressed path is copied", () => {
    it("copies the buckets array, the addressed bucket and its items, and nothing else", () => {
        const value = buckets();
        const untouchedBucket = value[1];
        const untouchedItem = value[0].items[1];

        const result = updateBucketItemAt(value, { bucketIndex: 0, itemIndex: 0 }, (item) => ({
            ...item,
            format: "0.00%",
        }));

        expect(result).not.toBe(value);
        expect(result[0]).not.toBe(value[0]);
        expect(result[0].items).not.toBe(value[0].items);
        expect(result[0].items![0]).not.toBe(value[0].items![0]);

        // the siblings are the SAME objects
        expect(result[1]).toBe(untouchedBucket);
        expect(result[0].items![1]).toBe(untouchedItem);
    });

    it("leaves the other buckets alone when one bucket changes", () => {
        const value = buckets();
        const untouchedBucket = value[0];

        const result = updateEveryBucket(value, (bucket) =>
            bucket.localIdentifier === "view" ? { ...bucket, chartType: "line" } : bucket,
        );

        expect(result).not.toBe(value);
        expect(result[0]).toBe(untouchedBucket);
        expect(result[1]).not.toBe(value[1]);
    });

    it("leaves the other items alone when one item changes", () => {
        const bucket = buckets()[0];
        const untouchedItem = bucket.items![1];

        const result = updateEveryBucketItem(bucket, (item) =>
            item.localIdentifier === "m1" ? { ...item, alias: "renamed" } : item,
        );

        expect(result).not.toBe(bucket);
        expect(result.items).not.toBe(bucket.items);
        expect(result.items![1]).toBe(untouchedItem);
    });

    it("keeps the untouched bucket when an item is removed from another one", () => {
        const value = buckets();
        const untouchedBucket = value[1];

        const result = removeBucketItemAt(value, { bucketIndex: 0, itemIndex: 0 });

        expect(result[0].items).toEqual([measure("m2")]);
        expect(result[1]).toBe(untouchedBucket);
    });
});

describe("replaceBucketItemAt past the end", () => {
    it("EXTENDS the items, which the same-bucket swap depends on", () => {
        // the swap computes both addresses against the ORIGINAL buckets, so after the first write
        // deletes a slot the second addresses an index the shortened collection no longer has
        const shortened: IRawBuckets = [{ localIdentifier: "measures", items: [measure("m2")] }];

        const result = replaceBucketItemAt(shortened, { bucketIndex: 0, itemIndex: 1 }, measure("m1"));

        expect(result[0].items!.map((item) => item.localIdentifier)).toEqual(["m2", "m1"]);
    });
});

describe("insertBucketItem", () => {
    it("never mutates the collection it is given", () => {
        const items = [measure("m1"), measure("m2")];

        const result = insertBucketItem(items, 1, measure("mX"));

        expect(result.map((item) => item.localIdentifier)).toEqual(["m1", "mX", "m2"]);
        expect(items.map((item) => item.localIdentifier)).toEqual(["m1", "m2"]);
    });

    it("seeds the first item when the bucket carries no items yet", () => {
        expect(insertBucketItem(undefined, 0, measure("m1"))).toEqual([measure("m1")]);
    });
});
