// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IAttributeDisplayFormMetadataObject } from "@gooddata/sdk-model";

import { getCatalogItemId, getCatalogItemTitle, getCatalogItemType } from "../utils.js";

describe("completion utils label support", () => {
    const displayForm: IAttributeDisplayFormMetadataObject = {
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

    it("should return label type for display form metadata object", () => {
        expect(getCatalogItemType(displayForm)).toBe("label");
    });

    it("should return display form id and title", () => {
        expect(getCatalogItemId(displayForm)).toBe("product.name");
        expect(getCatalogItemTitle(displayForm)).toBe("Product Name");
    });
});
