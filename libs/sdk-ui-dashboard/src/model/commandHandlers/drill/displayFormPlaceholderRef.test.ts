// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IAttributeDisplayFormMetadataObject, areObjRefsEqual, idRef } from "@gooddata/sdk-model";
import {
    displayFormPlaceholderRef,
    getDashboardAttributeFilterPlaceholdersFromUrl,
} from "@gooddata/sdk-model/internal";

const label = {
    type: "displayForm",
    id: "shared_id",
    ref: idRef("shared_id", "displayForm"),
    attribute: idRef("attr1", "attribute"),
} as IAttributeDisplayFormMetadataObject;

// A computed attribute's display form is fabricated client-side and its ref carries the computed
// attribute type; here it deliberately shares its id with the label above.
const computedAttribute = {
    type: "displayForm",
    id: "shared_id",
    ref: idRef("shared_id", "computedAttribute"),
    attribute: idRef("shared_id", "computedAttribute"),
} as IAttributeDisplayFormMetadataObject;

function placeholderRef(url: string) {
    return getDashboardAttributeFilterPlaceholdersFromUrl(url)[0].ref;
}

describe("displayFormPlaceholderRef", () => {
    it("matches a placeholder stored before computed attributes existed to the label", () => {
        const ref = placeholderRef("https://example.com/?f={dash_attribute_filter_selection(shared_id)}");

        expect(areObjRefsEqual(displayFormPlaceholderRef(label), ref)).toBe(true);
        expect(areObjRefsEqual(displayFormPlaceholderRef(computedAttribute), ref)).toBe(false);
    });

    it("matches a computed attribute placeholder to the computed attribute", () => {
        const ref = placeholderRef(
            "https://example.com/?f={dash_attribute_filter_selection(computed_attribute/shared_id)}",
        );

        expect(areObjRefsEqual(displayFormPlaceholderRef(computedAttribute), ref)).toBe(true);
        expect(areObjRefsEqual(displayFormPlaceholderRef(label), ref)).toBe(false);
    });
});
