// (C) 2023-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { IInsight } from "@gooddata/sdk-model";

import { newInsightMap } from "../../../../../_staging/metadata/objRefMap.js";
import { ExtendedDashboardWidget } from "../../../../../model/index.js";
import { isLocationIconEnabled } from "../addAttributeFilterUtils.js";

describe("add attribute filter utils", () => {
    describe("isLocationIconEnabled", () => {
        const createMockInsight = (type: string, id: string): IInsight => ({
            insight: {
                buckets: [],
                filters: [],
                sorts: [],
                properties: {},
                visualizationUrl: `local:${type}`,
                title: id,
                summary: "",
                identifier: id,
                uri: "dummy-url",
                ref: {
                    identifier: id,
                    type: "insight",
                },
                isLocked: false,
            },
        });

        const createMockInsightWidget = (id: string): ExtendedDashboardWidget => ({
            type: "insight",
            insight: {
                identifier: id,
                type: "insight",
            },
            ignoreDashboardFilters: [],
            drills: [],
            title: "Geo",
            description: "",
            ref: {
                identifier: id,
            },
            uri: "url",
            identifier: id,
            properties: {},
        });

        const mockInsightsMap = newInsightMap([
            createMockInsight("sankey", "insight_sankey"),
            createMockInsight("dependencywheel", "insight_dependencywheel"),
            createMockInsight("pushpin", "insight_pushpin"),
        ]);

        it("should returns true if any insight widget has a supported location icon chart type", () => {
            expect(
                isLocationIconEnabled(
                    [
                        createMockInsightWidget("insight_sankey"),
                        createMockInsightWidget("insight_dependencywheel"),
                        createMockInsightWidget("insight_pushpin"),
                    ],
                    mockInsightsMap,
                ),
            ).toBe(true);

            expect(
                isLocationIconEnabled(
                    [createMockInsightWidget("insight_sankey"), createMockInsightWidget("insight_pushpin")],
                    mockInsightsMap,
                ),
            ).toBe(true);

            expect(isLocationIconEnabled([createMockInsightWidget("insight_pushpin")], mockInsightsMap)).toBe(
                true,
            );
        });

        it("should returns false if no insight widget has a supported location icon chart type", () => {
            expect(
                isLocationIconEnabled(
                    [
                        createMockInsightWidget("insight_sankey"),
                        createMockInsightWidget("insight_dependencywheel"),
                    ],
                    mockInsightsMap,
                ),
            ).toBe(false);
        });
    });
});
