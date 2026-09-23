// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IUnavailableDashboardReference } from "@gooddata/sdk-backend-spi";
import { type IDrillToCustomUrl, idRef, localIdRef } from "@gooddata/sdk-model";

import { isDrillRestricted } from "../../../store/widgetDrills/drillRestrictionUtils.js";

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
        origin: { type: "drillFromAttribute", attribute: localIdRef("attribute1") },
        target: { url },
    };
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

describe("restricted drill URL dependencies", () => {
    it.each([
        ["attribute_title(label1)", "label1", "displayForm"],
        ["dash_attribute_filter_selection(label1)", "label1", "displayForm"],
        ["attribute_filter_selection(label1)", "label1", "displayForm"],
        ["attribute_title(computed_attribute/ca1)", "ca1", "computedAttribute"],
        ["dash_mvf_condition(metric1)", "metric1", "measure"],
    ])("blocks the complete URL for restricted %s", (placeholder, identifier, type) => {
        // The ref type comes from the parser; compare with separately typed availability entries.
        const unavailable = [
            { ref: idRef("label1", "displayForm"), type: "displayForm", reason: "forbidden" },
            { ref: idRef("ca1", "computedAttribute"), type: "computedAttribute", reason: "forbidden" },
            { ref: idRef("metric1", "measure"), type: "measure", reason: "forbidden" },
        ] satisfies IUnavailableDashboardReference[];
        const matching = unavailable.filter(
            (entry) => entry.type === type && entry.ref.identifier === identifier,
        );
        expect(isDrillRestricted(drillWithUrl(`https://example.com/?value={${placeholder}}`), matching)).toBe(
            true,
        );
    });

    it("checks the saved metric behind a local measure without treating the local ID as a metric", () => {
        const drill = drillWithUrl("https://example.com/{mvf_condition(m1)}");
        const unavailable: IUnavailableDashboardReference[] = [
            { ref: idRef("m1", "measure"), type: "measure", reason: "forbidden" },
        ];
        expect(isDrillRestricted(drill, unavailable)).toBe(false);
        const saved = {
            ...drill,
            target: { ...drill.target, references: { "{mvf_condition(m1)}": [idRef("revenue", "measure")] } },
        };
        expect(isDrillRestricted(saved, unavailable)).toBe(false);
        expect(
            isDrillRestricted(saved, [
                { ref: idRef("revenue", "measure"), type: "measure", reason: "forbidden" },
            ]),
        ).toBe(true);
    });

    it("does not restrict a URL because of a removed placeholder's saved dependency", () => {
        const drill = drillWithUrl("https://example.com/{mvf_condition(current)}");
        drill.target.references = {
            "{dash_mvf_condition(removed)}": [idRef("removed", "measure")],
            "{mvf_condition(current)}": [idRef("readable", "measure")],
        };
        expect(
            isDrillRestricted(drill, [
                { ref: idRef("removed", "measure"), type: "measure", reason: "forbidden" },
            ]),
        ).toBe(false);
    });

    it("does not confuse missing references or equal identifiers of another type with restrictions", () => {
        const drill = drillWithUrl("https://example.com/?value={attribute_title(label1)}");
        expect(
            isDrillRestricted(drill, [
                { ref: idRef("label1", "displayForm"), type: "displayForm", reason: "notFound" },
            ]),
        ).toBe(false);
        expect(
            isDrillRestricted(drill, [
                { ref: idRef("label1", "measure"), type: "measure", reason: "forbidden" },
            ]),
        ).toBe(false);
        expect(isDrillRestricted(drill, [])).toBe(false);
    });
});
