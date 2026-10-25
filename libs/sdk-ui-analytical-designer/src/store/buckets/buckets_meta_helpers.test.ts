// (C) 2007-2026 GoodData Corporation

// @vitest-environment node
import { describe, expect, it } from "vitest";

import { isUnmodifiedAndAutoCreated, removeAutoCreatedMarker } from "./buckets_meta_helpers.js";
import { type IBucketsMetaState } from "./buckets_meta_state.js";

const BUCKET_META: IBucketsMetaState = {
    autoCreated: {
        "attr.country.id": true,
        "attr.product.id": true,
        "attr.department.id": false,
    },
    modified: {
        "attr.region.id": false,
        "attr.country.id": false,
        "attr.product.id": true,
        "attr.department.id": true,
    },
    collapsed: {},
};

describe("isUnmodifiedAndAutoCreated", () => {
    it("should return true if the item is not modified and autocreated", () => {
        expect(isUnmodifiedAndAutoCreated("attr.country.id", BUCKET_META)).toBe(true);
    });

    it("should return false if the item is modified and autocreated", () => {
        expect(isUnmodifiedAndAutoCreated("attr.product.id", BUCKET_META)).toBe(false);
    });

    it("should return false if the item is unmodified and not autocreated", () => {
        expect(isUnmodifiedAndAutoCreated("attr.region.id", BUCKET_META)).toBe(false);
    });

    it("should return false if the item is modified and not autocreated", () => {
        expect(isUnmodifiedAndAutoCreated("attr.department.id", BUCKET_META)).toBe(false);
    });

    it("should return false for a cache item the markers do not mention at all", () => {
        expect(isUnmodifiedAndAutoCreated("attr.unknown.id", BUCKET_META)).toBe(false);
    });
});

/**
 * The module's only WRITE. Its two identity guarantees are what keep a removal that touches no
 * auto-created attribute from rebuilding the subtree — and the removal chain runs it once per removed
 * item, so both are load-bearing rather than incidental.
 */
describe("removeAutoCreatedMarker", () => {
    it("drops the addressed marker and keeps the others", () => {
        const result = removeAutoCreatedMarker(BUCKET_META, "attr.country.id");

        expect(result.autoCreated).toEqual({
            "attr.product.id": true,
            "attr.department.id": false,
        });
    });

    it("leaves the `modified` markers alone", () => {
        const result = removeAutoCreatedMarker(BUCKET_META, "attr.country.id");

        expect(result.modified).toBe(BUCKET_META.modified);
    });

    it("answers the SAME value for a marker that is not there", () => {
        expect(removeAutoCreatedMarker(BUCKET_META, "attr.unknown.id")).toBe(BUCKET_META);
    });

    it.each([
        ["undefined", undefined],
        ["null", null],
    ])("answers the SAME value for an %s identifier — a measure has no attribute", (_, identifier) => {
        expect(removeAutoCreatedMarker(BUCKET_META, identifier)).toBe(BUCKET_META);
    });
});
