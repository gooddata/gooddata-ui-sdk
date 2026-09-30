// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type JsonApiAttributeOutList,
    type JsonApiAttributeOutWithLinks,
    type RestrictedObject,
} from "@gooddata/api-client-tiger";
import { idRef } from "@gooddata/sdk-model";

import { collectRestrictedObjects, resolveAttributeUnavailableReferences } from "./datasetLoader.js";

const state = {
    id: "state",
    type: "attribute",
    relationships: {
        attributeHierarchies: {
            data: [
                { id: "restricted", type: "attributeHierarchy" },
                { id: "readable", type: "attributeHierarchy" },
            ],
        },
    },
} as JsonApiAttributeOutWithLinks;

describe("resolveAttributeUnavailableReferences", () => {
    it("reports the restricted hierarchies the attribute belongs to", () => {
        const restricted: RestrictedObject[] = [
            { id: "restricted", type: "attributeHierarchy" },
            { id: "other", type: "attributeHierarchy" },
            { id: "restricted", type: "attribute" },
        ];

        expect(resolveAttributeUnavailableReferences(state, restricted)).toEqual([
            {
                ref: idRef("restricted", "attributeHierarchy"),
                type: "attributeHierarchy",
                reason: "forbidden",
            },
        ]);
    });

    it("reports nothing when the backend applies no object-level permissions", () => {
        expect(resolveAttributeUnavailableReferences(state, undefined)).toBeUndefined();
    });
});

describe("collectRestrictedObjects", () => {
    const page = (restricted?: RestrictedObject[]) =>
        ({ data: [], ...(restricted ? { meta: { restricted } } : {}) }) as JsonApiAttributeOutList;

    it("lists an object restricted on several pages once", () => {
        const shared: RestrictedObject = { id: "restricted", type: "attributeHierarchy" };
        const other: RestrictedObject = { id: "other", type: "attributeHierarchy" };

        expect(collectRestrictedObjects([page([shared]), page([shared, other])])).toEqual([shared, other]);
    });

    it("reports no restriction data when no page carries it", () => {
        expect(collectRestrictedObjects([page(), page()])).toBeUndefined();
    });
});
