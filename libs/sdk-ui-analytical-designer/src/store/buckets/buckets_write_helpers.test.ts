// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IRawBuckets } from "../../typings/buckets.js";

import { getBucketItemsInBuckets } from "./buckets_write_helpers.js";

/**
 * The cluster's flatten helper: a bucket WITHOUT an `items` key must contribute nothing.
 * `Array.concat(undefined)` would append `undefined` AS AN ITEM and every caller then reads properties
 * off it, so the guard is explicit and these specs pin it.
 */
describe("getBucketItemsInBuckets", () => {
    const plainBuckets: IRawBuckets = [
        { localIdentifier: "measures", items: [{ localIdentifier: "m1" }, { localIdentifier: "m2" }] },
        { localIdentifier: "empty" },
        { localIdentifier: "view", items: [{ localIdentifier: "a1" }] },
    ];

    it("flattens plain buckets and skips a bucket with no items key", () => {
        const items = getBucketItemsInBuckets(plainBuckets);

        expect(items).toHaveLength(3);
        expect(items.map((item) => item.localIdentifier)).toEqual(["m1", "m2", "a1"]);
    });

    it("returns an empty result for empty buckets", () => {
        expect(getBucketItemsInBuckets([])).toHaveLength(0);
    });

    it("answers a plain array, never a wrapped collection", () => {
        expect(Array.isArray(getBucketItemsInBuckets(plainBuckets))).toBe(true);
    });
});
