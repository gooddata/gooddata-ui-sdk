// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { getBucketIcon } from "./bucketIcons.js";

describe("getBucketIcon", () => {
    it("resolves a registered local id", () => {
        expect(getBucketIcon("local:area/bucket-title-measures.svg")).toBeTypeOf("function");
    });

    it("returns undefined for an unknown id and for an empty id", () => {
        expect(getBucketIcon("local:area/does-not-exist.svg")).toBeUndefined();
        expect(getBucketIcon("https://example.com/icon.svg")).toBeUndefined();
        expect(getBucketIcon("")).toBeUndefined();
        expect(getBucketIcon(undefined)).toBeUndefined();
    });

    it("does not resolve Object.prototype members", () => {
        expect(getBucketIcon("constructor")).toBeUndefined();
        expect(getBucketIcon("toString")).toBeUndefined();
        expect(getBucketIcon("__proto__")).toBeUndefined();
    });
});
