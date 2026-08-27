// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { IComputedAttributeMetadataObject } from "@gooddata/sdk-model";

import { createCopiedComputedAttribute } from "./computedAttributeCopy.js";

const MAQL = 'SELECT CASE WHEN {metric/won_activities} > 50 THEN "High" ELSE "Low" END';

const loaded: IComputedAttributeMetadataObject = {
    id: "rep_performance",
    uri: "rep_performance",
    ref: { identifier: "rep_performance", type: "computedAttribute" },
    type: "computedAttribute",
    title: "Rep Performance",
    description: "Band",
    tags: ["sales"],
    production: true,
    deprecated: false,
    unlisted: false,
    created: "2024-01-01",
    updated: "2024-01-02",
    expression: MAQL,
    dataType: "STRING",
    locale: "en-US",
    displayForms: [],
};

describe("createCopiedComputedAttribute", () => {
    it("re-derives the identity from the copied title", () => {
        const copy = createCopiedComputedAttribute(loaded);
        expect(copy.title).toBe("Rep Performance (2)");
        expect(copy.id).toBe("rep_performance__2_");
    });

    it("increments an existing copy suffix", () => {
        expect(createCopiedComputedAttribute({ ...loaded, title: "Rep Performance (2)" }).title).toBe(
            "Rep Performance (3)",
        );
    });

    it("carries the author-owned value shaping over", () => {
        expect(createCopiedComputedAttribute(loaded)).toMatchObject({
            expression: MAQL,
            dataType: "STRING",
            locale: "en-US",
            tags: ["sales"],
        });
    });

    it("drops the server-managed fields of the source", () => {
        const copy = createCopiedComputedAttribute(loaded);
        expect(copy).not.toHaveProperty("ref");
        expect(copy).not.toHaveProperty("uri");
        expect(copy).not.toHaveProperty("created");
        expect(copy).not.toHaveProperty("updated");
        expect(copy).not.toHaveProperty("displayForms");
    });

    it("omits the id when the source's was server-generated", () => {
        const copy = createCopiedComputedAttribute({
            ...loaded,
            id: "6f1a1d4e-1f2b-4c3d-8e9f-0a1b2c3d4e5f",
        });
        expect(copy).not.toHaveProperty("id");
    });
});
