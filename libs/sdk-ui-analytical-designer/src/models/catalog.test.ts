// (C) 2020-2026 GoodData Corporation

// @vitest-environment node
import { describe, expect, it } from "vitest";

import { type CatalogItem } from "@gooddata/sdk-model";

import { getCatalogMeasure } from "../tests/catalog.test.helpers.js";

import { getChangedItemsCount } from "./catalog.js";

describe("getChangedItems", () => {
    it("should find added, removed and changed items between two arrays of catalog items", () => {
        const firstMeasure = getCatalogMeasure(1);
        const secondMeasure = getCatalogMeasure(2);
        const thirdMeasure = getCatalogMeasure(3);
        const firstMeasureRenamed = {
            ...firstMeasure,
            measure: { ...firstMeasure.measure, name: "renamed" },
        };

        const firstGroup: ReadonlyArray<CatalogItem> = [firstMeasure, secondMeasure];
        const secondGroup: ReadonlyArray<CatalogItem> = [firstMeasureRenamed, thirdMeasure];

        expect(getChangedItemsCount(firstGroup, secondGroup)).toEqual(3);
    });
});
