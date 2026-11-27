// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { isCatalogItemTextGenerable } from "./guards.js";
import type { ICatalogItem } from "./types.js";

function buildItem(type: ICatalogItem["type"]): ICatalogItem {
    return {
        identifier: "obj.id",
        type,
        title: "Title",
        description: "Desc",
        tags: [],
        createdBy: "user",
        updatedBy: "user",
        createdAt: null,
        updatedAt: null,
        isLocked: false,
        isEditable: true,
    } as ICatalogItem;
}

describe("isCatalogItemTextGenerable", () => {
    it.each<ICatalogItem["type"]>([
        "insight",
        "analyticalDashboard",
        "measure",
        "fact",
        "attribute",
        "document",
    ])("returns true for %s", (type) => {
        expect(isCatalogItemTextGenerable(buildItem(type))).toBe(true);
    });

    it.each<ICatalogItem["type"]>(["dataSet", "parameter", "computedAttribute"])(
        "returns false for %s",
        (type) => {
            expect(isCatalogItemTextGenerable(buildItem(type))).toBe(false);
        },
    );

    it.each([undefined, null])("returns false for %s", (item) => {
        expect(isCatalogItemTextGenerable(item)).toBe(false);
    });
});
