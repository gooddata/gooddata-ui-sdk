// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type JsonApiAttributeOut,
    type JsonApiAttributeOutDocument,
    type JsonApiLabelOutDocument,
    type JsonApiLabelOutWithLinks,
} from "@gooddata/api-client-tiger";

import {
    convertAttributeLabels,
    convertAttributeWithSideloadedLabels,
    convertLabelDocument,
} from "./MetadataConverter.js";

const PRIMARY = "label.f_account.account.name";
const SECONDARY = "label.f_account.account.email";

const label = (id: string): JsonApiLabelOutWithLinks =>
    ({
        id,
        type: "label",
        attributes: { title: id, primary: id === PRIMARY },
    }) as JsonApiLabelOutWithLinks;

const attribute = (labelIds: string[], defaultViewId?: string): JsonApiAttributeOut =>
    ({
        id: "attr.f_account.account",
        type: "attribute",
        relationships: {
            labels: { data: labelIds.map((id) => ({ id, type: "label" })) },
            ...(defaultViewId ? { defaultView: { data: { id: defaultViewId, type: "label" } } } : {}),
        },
    }) as JsonApiAttributeOut;

/** Only labels the caller may view reach `included`, so only those reach the map. */
const labelsMap = (...ids: string[]): Record<string, JsonApiLabelOutWithLinks> =>
    Object.fromEntries(ids.map((id) => [id, label(id)]));

describe("convertAttributeLabels", () => {
    it("marks the defaultView label as default when it is resolvable", () => {
        const displayForms = convertAttributeLabels(
            attribute([PRIMARY, SECONDARY], SECONDARY),
            labelsMap(PRIMARY, SECONDARY),
        );

        expect(displayForms.map((df) => [df.id, df.isDefault])).toEqual([
            [PRIMARY, false],
            [SECONDARY, true],
        ]);
    });

    it("falls back to the primary label when no defaultView is set", () => {
        const displayForms = convertAttributeLabels(
            attribute([PRIMARY, SECONDARY]),
            labelsMap(PRIMARY, SECONDARY),
        );

        expect(displayForms.map((df) => [df.id, df.isDefault])).toEqual([
            [PRIMARY, true],
            [SECONDARY, false],
        ]);
    });

    it("falls back to the primary label when the defaultView is withheld by object permissions", () => {
        // The withheld label keeps its `relationships` linkage but is absent from `included`, so it
        // never reaches the map. Without resolving the reference the defaultView branch would be
        // taken and no label would end up marked default at all (F1-2602).
        const displayForms = convertAttributeLabels(
            attribute([PRIMARY, SECONDARY], SECONDARY),
            labelsMap(PRIMARY),
        );

        expect(displayForms.map((df) => [df.id, df.isDefault])).toEqual([[PRIMARY, true]]);
    });

    it("omits labels withheld by object permissions", () => {
        const displayForms = convertAttributeLabels(attribute([PRIMARY, SECONDARY]), labelsMap(PRIMARY));

        expect(displayForms.map((df) => df.id)).toEqual([PRIMARY]);
    });
});

function attributeDocument(
    conditionalFormatting: unknown,
    labelConditionalFormatting: unknown,
): JsonApiAttributeOutDocument {
    return {
        data: {
            id: "attribute.id",
            type: "attribute",
            attributes: {
                title: "Region",
                description: "",
                tags: [],
                conditionalFormatting,
            },
            relationships: {
                labels: { data: [{ id: "label.id", type: "label" }] },
            },
        },
        included: [
            {
                id: "label.id",
                type: "label",
                attributes: {
                    title: "Region name",
                    primary: true,
                    conditionalFormatting: labelConditionalFormatting,
                },
            },
        ],
    } as unknown as JsonApiAttributeOutDocument;
}

const RULE = {
    enabled: true,
    conditions: [
        {
            id: "c1",
            operator: "EQUAL_TO",
            value: { kind: "literal", value: "East" },
            format: { scope: "cell" },
        },
    ],
};

describe("convertAttributeWithSideloadedLabels — conditionalFormatting", () => {
    it("surfaces the attribute's own conditionalFormatting when enabled", () => {
        const attribute = convertAttributeWithSideloadedLabels(attributeDocument(RULE, undefined));
        expect(attribute.conditionalFormatting).toEqual(RULE);
    });

    it("surfaces the attribute's own conditionalFormatting when disabled", () => {
        const disabled = { ...RULE, enabled: false };
        const attribute = convertAttributeWithSideloadedLabels(attributeDocument(disabled, undefined));
        expect(attribute.conditionalFormatting).toEqual(disabled);
    });

    it("has no conditionalFormatting on the attribute when the field is absent", () => {
        const attribute = convertAttributeWithSideloadedLabels(attributeDocument(undefined, undefined));
        expect(attribute.conditionalFormatting).toBeUndefined();
    });

    it("surfaces a label's own conditionalFormatting, independent of its attribute's", () => {
        const attribute = convertAttributeWithSideloadedLabels(attributeDocument(undefined, RULE));
        expect(attribute.displayForms[0]?.conditionalFormatting).toEqual(RULE);
    });

    it("has no conditionalFormatting on a label when the field is absent, even if the attribute has one", () => {
        const attribute = convertAttributeWithSideloadedLabels(attributeDocument(RULE, undefined));
        expect(attribute.displayForms[0]?.conditionalFormatting).toBeUndefined();
    });
});

function labelDocument(tags: string[] | undefined): JsonApiLabelOutDocument {
    return {
        data: {
            id: "label.id",
            type: "label",
            attributes: {
                title: "Region name",
                primary: true,
                tags,
            },
            relationships: {
                attribute: { data: { id: "attribute.id", type: "attribute" } },
            },
        },
        links: { self: "/label.id" },
    } as unknown as JsonApiLabelOutDocument;
}

describe("convertLabelDocument — tags", () => {
    it("surfaces the label's own tags from the response", () => {
        const label = convertLabelDocument(labelDocument(["tag1", "tag2"]));
        expect(label.tags).toEqual(["tag1", "tag2"]);
    });

    it("defaults to an empty array when the response has no tags", () => {
        const label = convertLabelDocument(labelDocument(undefined));
        expect(label.tags).toEqual([]);
    });
});

describe("convertLabelDocument — isDefault", () => {
    it("is left undefined even for a primary label, since this response carries no defaultView context to confirm it", () => {
        const label = convertLabelDocument(labelDocument(undefined));
        expect(label.isDefault).toBeUndefined();
    });
});
