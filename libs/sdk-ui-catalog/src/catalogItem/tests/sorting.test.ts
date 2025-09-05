// (C) 2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { GenAIObjectType, ISemanticSearchResultItem } from "@gooddata/sdk-model";

import type { ObjectType } from "../../objectType/index.js";
import { sortCatalogItems } from "../sorting.js";
import type { ICatalogItem } from "../types.js";

function makeFeedItem(type: ObjectType, identifier: string) {
    return { type, identifier } as ICatalogItem;
}

function makeSearchItem(id: string, type: GenAIObjectType, score?: number) {
    return { id, type, score } as ISemanticSearchResultItem;
}

describe("sortCatalogItems", () => {
    it("keeps API order when no search items", () => {
        const feedItems = [makeFeedItem("insight", "b"), makeFeedItem("insight", "a")];
        const sortedItems = sortCatalogItems(feedItems, []);
        expect(sortedItems.map((item) => item.identifier)).toEqual(["b", "a"]);
    });

    it("groups by type according to OBJECT_TYPE_ORDER", () => {
        const feedItems = [
            makeFeedItem("attribute", "a1"),
            makeFeedItem("insight", "v1"),
            makeFeedItem("analyticalDashboard", "d1"),
            makeFeedItem("measure", "m1"),
            makeFeedItem("fact", "f1"),
        ];
        const searchItems = [
            makeSearchItem("a1", "attribute", 10),
            makeSearchItem("v1", "visualization", 10),
            makeSearchItem("d1", "dashboard", 10),
            makeSearchItem("m1", "metric", 10),
            makeSearchItem("f1", "fact", 10),
        ];
        const sortedItems = sortCatalogItems(feedItems, searchItems);
        expect(sortedItems.map((item) => item.type)).toEqual([
            "analyticalDashboard",
            "insight",
            "measure",
            "attribute",
            "fact",
        ]);
    });

    it("orders by score descending within a type group", () => {
        const feedItems = [
            makeFeedItem("insight", "a"),
            makeFeedItem("insight", "b"),
            makeFeedItem("insight", "c"),
        ];
        const searchItems = [
            makeSearchItem("a", "visualization", 1),
            makeSearchItem("b", "visualization", 5),
        ];
        const sortedItems = sortCatalogItems(feedItems, searchItems);
        expect(sortedItems.map((item) => item.identifier)).toEqual(["b", "a", "c"]);
    });

    it("falls back to API order when scores equal or missing", () => {
        const feedItems = [makeFeedItem("insight", "a"), makeFeedItem("insight", "b")];
        const searchItems = [
            makeSearchItem("a", "visualization", 3),
            makeSearchItem("b", "visualization", 3),
        ];
        const sortedItems = sortCatalogItems(feedItems, searchItems);
        expect(sortedItems.map((item) => item.identifier)).toEqual(["a", "b"]);
    });

    it("keeps un-scored items after scored within same type, preserving API order", () => {
        const feedItems = [
            makeFeedItem("insight", "a"),
            makeFeedItem("insight", "b"),
            makeFeedItem("insight", "c"),
        ];
        const searchItems = [makeSearchItem("b", "visualization", 1)];
        const sortedItems = sortCatalogItems(feedItems, searchItems);
        expect(sortedItems.map((i) => i.identifier)).toEqual(["b", "a", "c"]);
    });

    it("handles mixed score values (negative, zero, positive) in desc order", () => {
        const feedItems = [
            makeFeedItem("measure", "m1"),
            makeFeedItem("measure", "m2"),
            makeFeedItem("measure", "m3"),
        ];
        const searchItems = [
            makeSearchItem("m1", "metric", -1),
            makeSearchItem("m2", "metric", 0),
            makeSearchItem("m3", "metric", 10),
        ];
        const sortedItems = sortCatalogItems(feedItems, searchItems);
        expect(sortedItems.map((i) => i.identifier)).toEqual(["m3", "m2", "m1"]);
    });

    it("ignores search IDs not present in feed and sorts the subset correctly", () => {
        const feedItems = [makeFeedItem("attribute", "a1"), makeFeedItem("attribute", "a2")];
        const searchItems = [
            makeSearchItem("missing", "attribute", 10),
            makeSearchItem("a2", "attribute", 1),
        ];
        const sortedItems = sortCatalogItems(feedItems, searchItems);
        expect(sortedItems.map((i) => i.identifier)).toEqual(["a2", "a1"]);
    });

    it("duplicate IDs in search: last score wins (deterministic map)", () => {
        const feedItems = [makeFeedItem("fact", "f2"), makeFeedItem("fact", "f1")];
        const searchItems = [makeSearchItem("f1", "fact", 1), makeSearchItem("f1", "fact", 10)];
        const sortedItems = sortCatalogItems(feedItems, searchItems);
        expect(sortedItems.map((i) => i.identifier)).toEqual(["f1", "f2"]);
    });
});
