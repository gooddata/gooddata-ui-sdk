// (C) 2019-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IAttributeDisplayFormMetadataObject } from "../ldm/metadata/attributeDisplayForm/index.js";
import { idRef, uriRef } from "../objRef/factory.js";

import {
    attributeIdentifierToPlaceholder,
    dashboardAttributeFilterToPlaceholder,
    displayFormPlaceholderRef,
    getAttributeIdentifiersPlaceholdersFromUrl,
    getDashboardAttributeFilterPlaceholdersFromUrl,
    getDashboardMeasureValueFilterPlaceholdersFromUrl,
    getInsightAttributeFilterPlaceholdersFromUrl,
    getInsightMeasureValueFilterPlaceholdersFromUrl,
    insightAttributeFilterToPlaceholder,
    joinDrillUrlParts,
    splitDrillUrlParts,
} from "./drillUrl.js";

describe("drill url placeholders", () => {
    it("should extracted placeholders", () => {
        const attributeIdentifiers = getAttributeIdentifiersPlaceholdersFromUrl(
            "https://google.com/?q={attribute_title(campaign_channels.category)}&b={attribute_title(6c2664ac21764748910953139a3aedad:campaign_channels.category)}",
        );
        expect(attributeIdentifiers).toMatchSnapshot();
    });

    it("should split and join parts", () => {
        const url =
            "https://google.com/?q={attribute_title(campaign_channels.category)}&b={attribute_title(6c2664ac21764748910953139a3aedad:campaign_channels.category)}";

        const urlParts = splitDrillUrlParts(url);
        expect(urlParts).toMatchSnapshot();

        expect(joinDrillUrlParts(urlParts)).toBe(url);
    });

    it("should accept string in join (back compatibility with old saved dashboards)", () => {
        const url =
            "https://google.com/?q={attribute_title(campaign_channels.category)}&b={attribute_title(6c2664ac21764748910953139a3aedad:campaign_channels.category)}";

        expect(joinDrillUrlParts(url)).toBe(url);
    });

    it("should reference a computed attribute by its own type, not as a display form", () => {
        const url = "https://example.com/?q={attribute_title(computed_attribute/ca1)}";

        expect(getAttributeIdentifiersPlaceholdersFromUrl(url)).toEqual([
            {
                placeholder: "{attribute_title(computed_attribute/ca1)}",
                identifier: "ca1",
                ref: {
                    identifier: "ca1",
                    type: "computedAttribute",
                },
                toBeEncoded: true,
            },
        ]);

        const urlParts = splitDrillUrlParts(url);
        expect(urlParts).toEqual(["https://example.com/?q=", idRef("ca1", "computedAttribute"), ""]);
        expect(joinDrillUrlParts(urlParts)).toBe(url);
    });

    it("should build the placeholder text for a display form and for a computed attribute", () => {
        expect(attributeIdentifierToPlaceholder(idRef("label1", "displayForm"))).toBe(
            "{attribute_title(label1)}",
        );
        expect(attributeIdentifierToPlaceholder(idRef("ca1", "computedAttribute"))).toBe(
            "{attribute_title(computed_attribute/ca1)}",
        );
    });

    it("should reference a computed attribute from the filter selection placeholders", () => {
        expect(
            getDashboardAttributeFilterPlaceholdersFromUrl(
                "https://example.com/?f={dash_attribute_filter_selection(computed_attribute/ca1)}",
            ),
        ).toEqual([
            {
                placeholder: "{dash_attribute_filter_selection(computed_attribute/ca1)}",
                identifier: "ca1",
                ref: { identifier: "ca1", type: "computedAttribute" },
                toBeEncoded: true,
            },
        ]);

        expect(
            getInsightAttributeFilterPlaceholdersFromUrl(
                "https://example.com/?f={attribute_filter_selection(computed_attribute/ca1)}",
            ),
        ).toEqual([
            {
                placeholder: "{attribute_filter_selection(computed_attribute/ca1)}",
                identifier: "ca1",
                ref: { identifier: "ca1", type: "computedAttribute" },
                toBeEncoded: true,
            },
        ]);
    });

    it("should keep the filter selection placeholders unprefixed for a display form", () => {
        expect(dashboardAttributeFilterToPlaceholder(idRef("label1", "displayForm"))).toBe(
            "{dash_attribute_filter_selection(label1)}",
        );
        expect(dashboardAttributeFilterToPlaceholder(idRef("ca1", "computedAttribute"))).toBe(
            "{dash_attribute_filter_selection(computed_attribute/ca1)}",
        );
        expect(insightAttributeFilterToPlaceholder(idRef("label1", "displayForm"))).toBe(
            "{attribute_filter_selection(label1)}",
        );
        expect(insightAttributeFilterToPlaceholder(idRef("ca1", "computedAttribute"))).toBe(
            "{attribute_filter_selection(computed_attribute/ca1)}",
        );
    });

    it("should name a display form by identifier even when its ref is a uri", () => {
        // A placeholder can only name its target by identifier, so a uri-backed display form has to
        // fall back to its id rather than leaking the uri into the URL.
        const uriBackedDisplayForm = {
            id: "label1",
            ref: uriRef("/gdc/md/project/obj/123"),
        } as IAttributeDisplayFormMetadataObject;

        expect(displayFormPlaceholderRef(uriBackedDisplayForm)).toEqual(idRef("label1", "displayForm"));
        expect(attributeIdentifierToPlaceholder(displayFormPlaceholderRef(uriBackedDisplayForm))).toBe(
            "{attribute_title(label1)}",
        );
    });

    it("should keep the computed attribute type when naming a display form", () => {
        const computedAttribute = {
            id: "ca1",
            ref: idRef("ca1", "computedAttribute"),
        } as IAttributeDisplayFormMetadataObject;

        expect(displayFormPlaceholderRef(computedAttribute)).toEqual(idRef("ca1", "computedAttribute"));
        expect(attributeIdentifierToPlaceholder(displayFormPlaceholderRef(computedAttribute))).toBe(
            "{attribute_title(computed_attribute/ca1)}",
        );
    });

    it("should extract dashboard measure value filter placeholders", () => {
        const placeholders = getDashboardMeasureValueFilterPlaceholdersFromUrl(
            "https://example.com/?condition={dash_mvf_condition(metric.revenue)}",
        );

        expect(placeholders).toEqual([
            {
                placeholder: "{dash_mvf_condition(metric.revenue)}",
                identifier: "metric.revenue",
                ref: {
                    identifier: "metric.revenue",
                    type: "measure",
                },
                toBeEncoded: true,
            },
        ]);
    });

    it("should extract insight measure value filter placeholders", () => {
        const placeholders = getInsightMeasureValueFilterPlaceholdersFromUrl(
            "https://example.com/?condition={mvf_condition(revenue_local_id)}",
        );

        expect(placeholders).toEqual([
            {
                placeholder: "{mvf_condition(revenue_local_id)}",
                identifier: "revenue_local_id",
                ref: {
                    identifier: "revenue_local_id",
                    type: "measure",
                },
                toBeEncoded: true,
            },
        ]);
    });
});
