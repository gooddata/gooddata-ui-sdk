// (C) 2026 GoodData Corporation

// @vitest-environment node
import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { type ICatalogEntries, type ICatalogEntry } from "../typings/state_objects.js";

import { getAttribute, getAttributeByIdentifier } from "./decorated_bucket_item.js";
import {
    attributeCacheKey,
    attributeCacheNamespace,
    computedAttributeCacheKey,
    findAttributeCacheItem,
    findAttributeCacheItemByRef,
    getCacheKeyForAttributeItem,
} from "./item_cache_lookup.js";

describe("item cache lookup", () => {
    const attributeEntry: ICatalogEntry = {
        type: "attribute",
        identifier: "shared_id",
        title: "Region",
        ref: idRef("shared_id", "attribute"),
        displayForms: [],
    };
    const computedAttributeEntry: ICatalogEntry = {
        type: "computedAttribute",
        identifier: "shared_id",
        title: "Revenue bucket",
        ref: idRef("shared_id", "computedAttribute"),
        displayForms: [],
    };

    const itemCache: ICatalogEntries = {
        [attributeCacheKey("shared_id")]: attributeEntry,
        [computedAttributeCacheKey("shared_id")]: computedAttributeEntry,
        [computedAttributeCacheKey("only_computed")]: {
            ...computedAttributeEntry,
            identifier: "only_computed",
        },
    };

    describe("getCacheKeyForAttributeItem", () => {
        it("should address a computed attribute item in the computed attribute namespace", () => {
            expect(getCacheKeyForAttributeItem("some_id", true)).toEqual("computedAttribute.some_id");
        });

        it("should address a plain attribute item in the attribute namespace", () => {
            expect(getCacheKeyForAttributeItem("some_id", false)).toEqual("attribute.some_id");
            expect(getCacheKeyForAttributeItem("some_id")).toEqual("attribute.some_id");
        });
    });

    describe("findAttributeCacheItem", () => {
        it("should prefer a real attribute over a computed attribute sharing the identifier", () => {
            expect(findAttributeCacheItem(itemCache, "shared_id")).toEqual(attributeEntry);
        });

        it("should fall back to the computed attribute namespace", () => {
            expect(findAttributeCacheItem(itemCache, "only_computed")?.type).toEqual("computedAttribute");
        });

        it("should return undefined for an unknown identifier", () => {
            expect(findAttributeCacheItem(itemCache, "nope")).toBeUndefined();
        });
    });

    describe("findAttributeCacheItemByRef", () => {
        it("should select the computed attribute when identifiers collide", () => {
            expect(
                findAttributeCacheItemByRef(itemCache, "shared_id", idRef("shared_id", "computedAttribute")),
            ).toEqual(computedAttributeEntry);
        });

        it("should select the plain attribute when identifiers collide", () => {
            expect(
                findAttributeCacheItemByRef(itemCache, "shared_id", idRef("shared_id", "attribute")),
            ).toEqual(attributeEntry);
        });

        it("should answer nothing rather than guess when colliding entries both miss the ref", () => {
            // answering the plain attribute here would bind a computed filter to a different object
            expect(
                findAttributeCacheItemByRef(itemCache, "shared_id", idRef("stale_df", "displayForm")),
            ).toBeUndefined();
        });

        it("should still fall back to the identifier when only one namespace is populated", () => {
            // a fabricated cache entry carries no display forms, so a filter on a secondary display
            // form misses the ref test and has only the identifier left to resolve by
            expect(
                findAttributeCacheItemByRef(itemCache, "only_computed", idRef("secondary_df", "displayForm")),
            ).toEqual({ ...computedAttributeEntry, identifier: "only_computed" });
        });

        it("should return undefined for an identifier in neither namespace", () => {
            expect(
                findAttributeCacheItemByRef(itemCache, "nope", idRef("nope", "attribute")),
            ).toBeUndefined();
        });
    });

    describe("getAttribute", () => {
        it("should resolve a computed attribute item through its flag", () => {
            const resolved = getAttribute(
                { type: "attribute", attribute: "shared_id", isComputedAttribute: true },
                itemCache,
            );

            expect(resolved.type).toEqual("computedAttribute");
        });

        it("should resolve in the namespace the caller names, with no fallback between them", () => {
            expect(
                getAttributeByIdentifier("shared_id", itemCache, attributeCacheNamespace(true)).type,
            ).toEqual("computedAttribute");
            expect(
                getAttributeByIdentifier("shared_id", itemCache, attributeCacheNamespace(false)).type,
            ).toEqual("attribute");

            // naming the wrong namespace is a programming error, not something to paper over
            expect(() =>
                getAttributeByIdentifier("only_computed", itemCache, attributeCacheNamespace(false)),
            ).toThrow(/was not found in cache/);
        });

        it("should throw for an identifier in neither namespace", () => {
            expect(() => getAttributeByIdentifier("nope", itemCache, "attribute")).toThrow(
                /was not found in cache/,
            );
        });

        it("should keep resolving a plain attribute item from the attribute namespace", () => {
            const resolved = getAttribute({ type: "attribute", attribute: "shared_id" }, itemCache);

            expect(resolved.type).toEqual("attribute");
        });
    });
});
