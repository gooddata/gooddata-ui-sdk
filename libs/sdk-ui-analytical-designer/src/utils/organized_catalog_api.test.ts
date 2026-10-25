// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ICatalogAttribute, type ICatalogComputedAttribute } from "@gooddata/sdk-model";

import { mergeAvailableMeasureAttributes } from "./organized_catalog_api.js";

// The catalog answers attributes and computed attributes as two separate, independently sorted
// lists; a plain concatenation would strand every computed attribute at the tail of the picker.
// This is a pure test on purpose: the package's vitest pool runs with `isolate: false`, where
// module-mocking the backend is unreliable (the mock loses whenever another file in the worker
// already imported it).
describe("mergeAvailableMeasureAttributes", () => {
    const attribute = (title: string) => ({ type: "attribute", attribute: { title } }) as ICatalogAttribute;
    const computedAttribute = (title: string) =>
        ({ type: "computedAttribute", computedAttribute: { title } }) as ICatalogComputedAttribute;

    it("files computed attributes in alphabetically among the regular attributes", () => {
        const merged = mergeAvailableMeasureAttributes(
            [attribute("Account"), attribute("Product"), attribute("Region")],
            [computedAttribute("Performance Tier"), computedAttribute("Amount Bucket")],
        );

        expect(
            merged.map((item) =>
                item.type === "computedAttribute" ? item.computedAttribute.title : item.attribute.title,
            ),
        ).toEqual(["Account", "Amount Bucket", "Performance Tier", "Product", "Region"]);
    });

    it("keeps an attribute-only list as it came", () => {
        const merged = mergeAvailableMeasureAttributes([attribute("Account"), attribute("Product")], []);

        expect(merged.map((item) => (item as ICatalogAttribute).attribute.title)).toEqual([
            "Account",
            "Product",
        ]);
    });
});
