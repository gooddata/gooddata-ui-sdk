// (C) 2025-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { hasOneToManySegmentRelationship } from "../geoSegmentConflict.js";

describe("hasOneToManySegmentRelationship", () => {
    it("returns false for 1:1 relationship", () => {
        const keys = ["country:US", "country:CA"];
        const segments = ["New York", "Toronto"];

        expect(hasOneToManySegmentRelationship(keys, segments)).toBe(false);
    });

    it("returns true for 1:M relationship", () => {
        const keys = ["country:US", "country:US", "country:CA"];
        const segments = ["New York", "Boston", "Toronto"];

        expect(hasOneToManySegmentRelationship(keys, segments)).toBe(true);
    });

    it("ignores empty segment values", () => {
        const keys = ["country:US", "country:US"];
        const segments = ["", "   "];

        expect(hasOneToManySegmentRelationship(keys, segments)).toBe(false);
    });

    it("normalizes whitespace in segment values", () => {
        const keys = ["country:US", "country:US"];
        const segments = ["New York", " New York "];

        expect(hasOneToManySegmentRelationship(keys, segments)).toBe(false);
    });

    it("uses segment element URIs to detect conflicts even with same display values", () => {
        const keys = ["country:US", "country:US"];
        const segmentValues = ["California", "California"];
        const segmentIdentifiers = ["/obj/segment/california-us", "/obj/segment/california-ca"];

        expect(hasOneToManySegmentRelationship(keys, segmentValues, segmentIdentifiers)).toBe(true);
    });

    it("returns false when location keys are missing", () => {
        const keys = ["", ""];
        const segmentValues = ["Alabama", "Alaska"];
        const segmentIdentifiers = ["/obj/segment/alabama", "/obj/segment/alaska"];

        expect(hasOneToManySegmentRelationship(keys, segmentValues, segmentIdentifiers)).toBe(false);
    });
});
