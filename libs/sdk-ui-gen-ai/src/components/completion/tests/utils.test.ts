// (C) 2026 GoodData Corporation

import { createIntl } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import {
    type CatalogItem,
    type IAttributeDisplayFormMetadataObject,
    type ICatalogAttribute,
    type ICatalogDateDataset,
    type ICatalogFact,
    type ICatalogMeasure,
} from "@gooddata/sdk-model";

import {
    getCatalogItemId,
    getCatalogItemTitle,
    getCatalogItemType,
    getOptions,
    matchTags,
    objRefToTextContentObject,
} from "../utils.js";

const intl = createIntl({ locale: "en", messages: {} });

const attribute: ICatalogAttribute = {
    type: "attribute",
    attribute: {
        type: "attribute",
        id: "attr.id",
        title: "Attribute Title",
        ref: { identifier: "attr.id" },
        uri: "attr.uri",
        description: "Attribute Description",
        production: true,
        deprecated: false,
        unlisted: false,
        displayForms: [],
        tags: ["tag1", "tag2"],
    },
    defaultDisplayForm: {
        type: "displayForm",
        id: "df.id",
        title: "DF Title",
        ref: { identifier: "df.id" },
        uri: "df.uri",
        description: "",
        production: true,
        deprecated: false,
        unlisted: false,
        attribute: { identifier: "attr.id" },
    },
    displayForms: [],
    geoPinDisplayForms: [],
    groups: [],
};

const measure: ICatalogMeasure = {
    type: "measure",
    measure: {
        type: "measure",
        id: "measure.id",
        title: "Measure Title",
        ref: { identifier: "measure.id" },
        uri: "measure.uri",
        description: "Measure Description",
        production: true,
        deprecated: false,
        unlisted: false,
        tags: ["tag2", "tag3"],
        expression: "",
        format: "",
    },
    groups: [],
};

const fact: ICatalogFact = {
    type: "fact",
    fact: {
        type: "fact",
        id: "fact.id",
        title: "Fact Title",
        ref: { identifier: "fact.id" },
        uri: "fact.uri",
        description: "Fact Description",
        production: true,
        deprecated: false,
        unlisted: false,
        tags: ["tag4"],
    },
    groups: [],
};

const dateDataset: ICatalogDateDataset = {
    type: "dateDataset",
    dataSet: {
        type: "dataSet",
        id: "date.id",
        title: "Date Title",
        ref: { identifier: "date.id" },
        uri: "date.uri",
        description: "Date Description",
        production: true,
        deprecated: false,
        unlisted: false,
        tags: ["tag5"],
    },
    relevance: 1,
    dateAttributes: [],
};

describe("matchTags", () => {
    it("should return true when no tags are provided", () => {
        expect(matchTags(attribute)).toBe(true);
    });

    it("should return true when item has included tag", () => {
        expect(matchTags(attribute, ["tag1"])).toBe(true);
    });

    it("should return false when item does not have included tag", () => {
        expect(matchTags(attribute, ["tag3"])).toBe(false);
    });

    it("should return false when item has excluded tag", () => {
        expect(matchTags(attribute, [], ["tag2"])).toBe(false);
    });

    it("should return true when item does not have excluded tag", () => {
        expect(matchTags(attribute, [], ["tag3"])).toBe(true);
    });

    it("should return true when item has included tag and no excluded tag", () => {
        expect(matchTags(attribute, ["tag1"], ["tag4"])).toBe(true);
    });

    it("should return false when item has both included and excluded tag", () => {
        expect(matchTags(attribute, ["tag1"], ["tag2"])).toBe(false);
    });

    it("should work for different catalog item types", () => {
        expect(matchTags(measure, ["tag3"])).toBe(true);
        expect(matchTags(fact, ["tag4"])).toBe(true);
        expect(matchTags(dateDataset, ["tag5"])).toBe(true);
    });
});

describe("getOptions", () => {
    const items: CatalogItem[] = [attribute, measure, fact, dateDataset];

    it("should return all options when no search or tags are provided", () => {
        const options = getOptions(intl, { items });
        // attribute (1), measure (1), fact (1), dateDataset (1 date + 0 attributes = 1)
        expect(options).toHaveLength(4);
    });

    it("should filter options by search string", () => {
        const options = getOptions(intl, { items, search: "Attribute" });
        expect(options).toHaveLength(1);
        expect(options[0].label).toBe("Attribute Title");
    });

    it("should filter options by includeTags", () => {
        const options = getOptions(intl, { items, includeTags: ["tag2"] });
        // attribute has tag2, measure has tag2
        expect(options).toHaveLength(2);
    });

    it("should filter options by excludeTags", () => {
        const options = getOptions(intl, { items, excludeTags: ["tag2"] });
        // attribute has tag2 (excluded), measure has tag2 (excluded), fact has tag4, dateDataset has tag5
        expect(options).toHaveLength(2);
        expect(options.map((o) => o.label)).toContain("Fact Title");
        expect(options.map((o) => o.label)).toContain("Date Title");
    });

    it("should filter out hidden items", () => {
        const hiddenAttribute: ICatalogAttribute = {
            ...attribute,
            attribute: { ...attribute.attribute, isHidden: true },
        };
        const options = getOptions(intl, { items: [hiddenAttribute] });
        expect(options).toHaveLength(0);
    });

    it("should handle onCompletionSelected callback", () => {
        const onCompletionSelected = vi.fn();
        const options = getOptions(intl, { items: [attribute], onCompletionSelected });
        const opt = options[0];

        // We can't easily call apply because it requires EditorView mock
        // but we can check if it's a function
        expect(typeof opt.apply).toBe("function");
    });
});

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

describe("objRefToTextContentObject", () => {
    it("should convert measure/displayForm identifier refs to metric/label", () => {
        expect(
            objRefToTextContentObject(
                {
                    type: "measure",
                    identifier: "m.id",
                },
                "Revenue",
            ),
        ).toEqual({
            id: "m.id",
            title: "Revenue",
            type: "metric",
        });

        expect(
            objRefToTextContentObject({
                type: "displayForm",
                identifier: "attr.name",
            }),
        ).toEqual({
            id: "attr.name",
            title: "attr.name",
            type: "label",
        });
    });

    it("should use forced type when provided", () => {
        expect(
            objRefToTextContentObject(
                {
                    type: "measure",
                    identifier: "m.id",
                },
                "Revenue",
                "fact",
            ),
        ).toEqual({
            id: "m.id",
            title: "Revenue",
            type: "fact",
        });
    });

    it("should return null for uri refs", () => {
        expect(
            objRefToTextContentObject({
                uri: "/gdc/md/demo/obj/123",
            }),
        ).toBeNull();
    });
});
