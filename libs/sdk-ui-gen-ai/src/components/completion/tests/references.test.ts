// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type CatalogItem } from "@gooddata/sdk-model";

import { type TextContentObject } from "../../../model.js";
import { collectReferences, replaceReferences } from "../references.js";

describe("replaceReferences", () => {
    it("should match references by both type and id", () => {
        const text = "Values: {metric/total} and {attribute/total}";
        const references: TextContentObject[] = [
            { id: "total", type: "attribute", title: "Total Attribute" },
            { id: "total", type: "metric", title: "Total Metric" },
        ];

        expect(replaceReferences(text, references)).toBe("Values: Total Metric and Total Attribute");
    });

    it("should keep token unchanged when only id matches but type does not", () => {
        const text = "Value: {metric/total}";
        const references: TextContentObject[] = [
            { id: "total", type: "attribute", title: "Total Attribute" },
        ];

        expect(replaceReferences(text, references)).toBe("Value: {metric/total}");
    });

    it("should replace label references", () => {
        const text = "Label: {label/product.name}";
        const references: TextContentObject[] = [
            { id: "product.name", type: "label", title: "Product Name" },
        ];

        expect(replaceReferences(text, references)).toBe("Label: Product Name");
    });

    it("should replace visualization references", () => {
        const text = "Viz: {visualization/sales-viz}";
        const references: TextContentObject[] = [
            { id: "sales-viz", type: "visualization", title: "Sales Visualization" },
        ];

        expect(replaceReferences(text, references)).toBe("Viz: Sales Visualization");
    });
});

describe("collectReferences", () => {
    it("should collect label references from catalog attribute display forms", () => {
        const displayForm = {
            type: "displayForm",
            id: "product.name",
            title: "Product Name",
            ref: { identifier: "product.name" },
            uri: "/gdc/md/demo/obj/123",
            description: "",
            production: true,
            deprecated: false,
            unlisted: false,
            attribute: { identifier: "product" },
        };
        const catalogAttribute = {
            type: "attribute",
            attribute: {
                type: "attribute",
                id: "product",
                title: "Product",
                ref: { identifier: "product" },
                uri: "/gdc/md/demo/obj/456",
                description: "",
                production: true,
                deprecated: false,
                unlisted: false,
                displayForms: [displayForm],
            },
            defaultDisplayForm: displayForm,
            displayForms: [displayForm],
            geoPinDisplayForms: [],
            group: "Attributes",
        } as unknown as CatalogItem;

        expect(collectReferences("Used: {label/product.name}", [catalogAttribute])).toEqual([
            { id: "product.name", type: "label", title: "Product Name" },
        ]);
    });
});
