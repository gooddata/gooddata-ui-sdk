// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import type { ICatalogItem } from "../../catalogItem/types.js";

import { isShareableCatalogItem, toShareTarget } from "./guards.js";
import type { ShareableCatalogItem } from "./types.js";

const itemBase = {
    description: "",
    tags: [] as string[],
    createdBy: "",
    updatedBy: "",
    createdAt: null,
    updatedAt: null,
    isLocked: false,
    isEditable: true,
};

const attribute: ShareableCatalogItem = {
    ...itemBase,
    type: "attribute",
    identifier: "attr.region",
    title: "Region",
};
const fact: ShareableCatalogItem = {
    ...itemBase,
    type: "fact",
    identifier: "fact.revenue",
    title: "Revenue",
};
const measure: ShareableCatalogItem = {
    ...itemBase,
    type: "measure",
    identifier: "metric.revenue",
    title: "Revenue metric",
};
const dashboard: ICatalogItem = {
    ...itemBase,
    type: "analyticalDashboard",
    identifier: "dashboard.overview",
    title: "Overview",
};

describe("isShareableCatalogItem", () => {
    it.each([
        { item: attribute, expected: true },
        { item: fact, expected: true },
        { item: measure, expected: true },
        { item: dashboard, expected: false },
    ])("returns $expected for $item.type", ({ item, expected }) => {
        expect(isShareableCatalogItem(item)).toBe(expected);
    });
});

describe("toShareTarget", () => {
    it("maps a measure to a measure-kind target", () => {
        expect(toShareTarget(measure)).toEqual({
            kind: "measure",
            ref: idRef("metric.revenue", "measure"),
        });
    });

    it("maps an attribute to an attribute-kind target", () => {
        expect(toShareTarget(attribute)).toEqual({
            kind: "attribute",
            ref: idRef("attr.region", "attribute"),
        });
    });
});
