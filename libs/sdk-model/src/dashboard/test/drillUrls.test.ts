// (C) 2019-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    getAttributeIdentifiersPlaceholdersFromUrl,
    getDashboardMeasureValueFilterPlaceholdersFromUrl,
    getInsightMeasureValueFilterPlaceholdersFromUrl,
    joinDrillUrlParts,
    splitDrillUrlParts,
} from "../drillUrl.js";

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
