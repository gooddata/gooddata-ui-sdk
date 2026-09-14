// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IDashboardLayout, type IInsightWidget, idRef } from "@gooddata/sdk-model";

import { cloneWithSanitizedIds as sanitizeFromBackend } from "../fromBackend/IdSanitization.js";
import { cloneWithSanitizedIds as sanitizeToBackend } from "../toBackend/IdSanitization.js";

import { convertLayout } from "./layoutConverter.js";

function layoutWithDrillUrl(url: string): IDashboardLayout {
    const widget = {
        type: "insight",
        insight: idRef("insight1", "insight"),
        ignoreDashboardFilters: [],
        drills: [
            {
                type: "drillToCustomUrl",
                transition: "new-window",
                origin: { type: "drillFromAttribute", attribute: idRef("label1", "displayForm") },
                target: { url },
            },
        ],
        title: "widget",
        description: "",
    } as unknown as IInsightWidget;

    return {
        type: "IDashboardLayout",
        sections: [{ type: "IDashboardLayoutSection", items: [{ type: "IDashboardLayoutItem", widget }] }],
    } as unknown as IDashboardLayout;
}

function drillUrlOf(layout: unknown) {
    return (layout as any).sections[0].items[0].widget.drills[0].target.url;
}

/**
 * The url stored on the backend is an array of string chunks and object references; the converters
 * build it on save and flatten it back on load. These assert the reference each placeholder is
 * stored as, and that loading the stored form reproduces the original url verbatim.
 */
describe("drill to custom url layout conversion", () => {
    it("stores a display form placeholder as a label reference and loads it back unchanged", () => {
        const url = "https://example.com/?q={attribute_title(campaign_channels.category)}&x=1";

        const stored = sanitizeToBackend(convertLayout(false, layoutWithDrillUrl(url)));

        expect(drillUrlOf(stored)).toEqual([
            "https://example.com/?q=",
            { identifier: { id: "campaign_channels.category", type: "label" } },
            "&x=1",
        ]);

        const loaded = convertLayout(true, sanitizeFromBackend(stored) as IDashboardLayout);
        expect(drillUrlOf(loaded)).toBe(url);
    });

    it("stores a computed attribute placeholder as a computed attribute reference and loads it back unchanged", () => {
        const url = "https://example.com/?q={attribute_title(computed_attribute/ca1)}&x=1";

        const stored = sanitizeToBackend(convertLayout(false, layoutWithDrillUrl(url)));

        expect(drillUrlOf(stored)).toEqual([
            "https://example.com/?q=",
            { identifier: { id: "ca1", type: "computedAttribute" } },
            "&x=1",
        ]);

        const loaded = convertLayout(true, sanitizeFromBackend(stored) as IDashboardLayout);
        expect(drillUrlOf(loaded)).toBe(url);
    });

    it("leaves the filter selection placeholders as plain text on both sides", () => {
        const url =
            "https://example.com/?a={dash_attribute_filter_selection(label1)}" +
            "&b={dash_attribute_filter_selection(computed_attribute/ca1)}" +
            "&c={attribute_filter_selection(label1)}";

        const stored = sanitizeToBackend(convertLayout(false, layoutWithDrillUrl(url)));

        expect(drillUrlOf(stored)).toEqual([url]);

        const loaded = convertLayout(true, sanitizeFromBackend(stored) as IDashboardLayout);
        expect(drillUrlOf(loaded)).toBe(url);
    });
});
