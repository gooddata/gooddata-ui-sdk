// (C) 2020-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { createAnalyticalDashboard, createListedDashboard } from "../../tests/constants.test.helpers.js";
import { privateDashboards, publicDashboards } from "../../tests/dashboard.test.helpers.js";

import { getInsightUsageOnDashboards } from "./insight_usage_helpers.js";
import { getInsightUsageOnDashboardsSelector } from "./insight_usage_selectors.js";
import { type IInsightUsage } from "./insight_usage_state.js";

describe("insight usage on dashboards", () => {
    describe("getInsightUsageOnDashboards", () => {
        it("should process and correctly sort provided dashboards", () => {
            const dashboards = [
                createAnalyticalDashboard("Sale2", "Bee2", 2),
                createAnalyticalDashboard("akh", "Bee4", 4),
                createAnalyticalDashboard("Bcd", "Bee5", 5),
                createAnalyticalDashboard("Sale1", "Bee1", 1),
                createAnalyticalDashboard("bdf", "Bee7", 7),
                createAnalyticalDashboard("Abc", "Bee6", 6),
                createAnalyticalDashboard("Selected Dashboard", "Bee3", 3),
            ];
            const allUserDashboards = [
                createListedDashboard("Sale2", "Bee2", 2),
                createListedDashboard("akh", "Bee4", 4),
                createListedDashboard("Bcd", "Bee5", 5),
                createListedDashboard("Sale1", "Bee1", 1),
                createListedDashboard("bdf", "Bee7", 7),
                createListedDashboard("Abc", "Bee6", 6),
                createListedDashboard("Selected Dashboard", "Bee3", 3),
            ];

            const result = getInsightUsageOnDashboards(dashboards, allUserDashboards);
            expect(result).toMatchSnapshot();
        });
    });

    describe("getInsightUsageOnDashboardsSelector", () => {
        it.each([[null], [undefined]])(
            "should return default object when usage info is %s",
            (usageInfo: IInsightUsage) => {
                const result = getInsightUsageOnDashboardsSelector.resultFunc(usageInfo, "id");
                expect(result).toMatchSnapshot();
            },
        );

        it("should return expected object from usage info from state", () => {
            const insightUsage: IInsightUsage = {
                allUserDashboards: [...publicDashboards, ...privateDashboards],
                referencedDashboards: [
                    createAnalyticalDashboard("Sale", "Bee", 123),
                    createAnalyticalDashboard("Revenue", "id3", 124),
                ],
            };
            const result = getInsightUsageOnDashboardsSelector.resultFunc(insightUsage, "id3");
            expect(result).toMatchSnapshot();
        });
    });
});
