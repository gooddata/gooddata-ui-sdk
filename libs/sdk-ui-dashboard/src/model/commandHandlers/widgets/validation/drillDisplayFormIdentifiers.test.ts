// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IDrillToCustomUrl, idRef } from "@gooddata/sdk-model";

import {
    extractDashboardFilterDisplayFormIdentifiers,
    extractDisplayFormIdentifiers,
    extractInsightFilterDisplayFormIdentifiers,
} from "./insightDrillDefinitionUtils.js";

/**
 * These refs are fed to resolveDisplayFormMetadata when a drill is saved. A computed attribute
 * rebuilt as a display form resolves as missing there, and the drill is rejected - so every extractor
 * has to keep the type the placeholder carried.
 */
function drillWithUrl(url: string): IDrillToCustomUrl {
    return {
        type: "drillToCustomUrl",
        transition: "new-window",
        origin: { type: "drillFromAttribute", attribute: idRef("label1", "displayForm") },
        target: { url },
    } as IDrillToCustomUrl;
}

describe("drill display form identifier extraction", () => {
    it.each([
        [
            "attribute_title",
            extractDisplayFormIdentifiers,
            "https://e.com/?a={attribute_title(computed_attribute/ca1)}&b={attribute_title(label1)}",
        ],
        [
            "dash_attribute_filter_selection",
            extractDashboardFilterDisplayFormIdentifiers,
            "https://e.com/?a={dash_attribute_filter_selection(computed_attribute/ca1)}&b={dash_attribute_filter_selection(label1)}",
        ],
        [
            "attribute_filter_selection",
            extractInsightFilterDisplayFormIdentifiers,
            "https://e.com/?a={attribute_filter_selection(computed_attribute/ca1)}&b={attribute_filter_selection(label1)}",
        ],
    ])("keeps the computed attribute type for %s placeholders", (_name, extract, url) => {
        expect(extract([drillWithUrl(url)])).toEqual([
            idRef("ca1", "computedAttribute"),
            idRef("label1", "displayForm"),
        ]);
    });
});
