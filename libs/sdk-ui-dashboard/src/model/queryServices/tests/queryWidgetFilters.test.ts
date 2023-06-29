// (C) 2021-2022 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { DashboardTester, preloadedTesterFactory } from "../../tests/DashboardTester.js";
import { queryWidgetFilters } from "../../queries/index.js";
import { idRef, IFilter, IWidget } from "@gooddata/sdk-model";
import {
    AdvancedFilterTestingDashboardIdentifier,
    AdvancedFilterTestingDashboardWidgets,
    FilterTestingDashboardIdentifier,
    FilterTestingDashboardWidgets,
} from "../../tests/fixtures/FilteredDashboards.fixtures";

describe("query widget filters", () => {
    describe("basic scenarios", () => {
        let Tester: DashboardTester;

        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, FilterTestingDashboardIdentifier);
        });

        it("should fail in case the widget does not exist", async () => {
            await expect(
                Tester.query(queryWidgetFilters(idRef("non existent widget"))),
            ).rejects.toMatchSnapshot({
                meta: expect.any(Object),
            } as any);
        });

        it.each<[string, IWidget]>([
            ["insight with no ignored filters", FilterTestingDashboardWidgets.NoIgnoredFilters.Insight],
            ["kpi with no ignored filters", FilterTestingDashboardWidgets.NoIgnoredFilters.Kpi],
            [
                "insight with ignored attribute filter",
                FilterTestingDashboardWidgets.IgnoredAttributeFilter.Insight,
            ],
            ["kpi with ignored attribute filter", FilterTestingDashboardWidgets.IgnoredAttributeFilter.Kpi],
            ["insight with ignored date filter", FilterTestingDashboardWidgets.IgnoredDateFilter.Insight],
            ["kpi with ignored date filter", FilterTestingDashboardWidgets.IgnoredDateFilter.Kpi],
        ])("should return filters for %s", async (_, widget) => {
            const result: IFilter[] = await Tester.query(queryWidgetFilters(widget));
            expect(result).toMatchSnapshot();
        });
    });

    describe("advanced scenarios", () => {
        let Tester: DashboardTester;

        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, AdvancedFilterTestingDashboardIdentifier);
        });

        it.each<[string, IWidget]>([
            [
                "insight with own attribute filter",
                AdvancedFilterTestingDashboardWidgets.InsightWithOwnAttributeFilter,
            ],
            ["insight with own date filter", AdvancedFilterTestingDashboardWidgets.InsightWithOwnDateFilter],
            [
                "insight with own ranking filter",
                AdvancedFilterTestingDashboardWidgets.InsightWithOwnRankingFilter,
            ],
            [
                "insight with own measure value filter",
                AdvancedFilterTestingDashboardWidgets.InsightWithOwnMeasureValueFilter,
            ],

            [
                "insight with all measures filtered by date",
                AdvancedFilterTestingDashboardWidgets.InsightWithAllMeasuresFilteredByDate,
            ],
            [
                "insight with some measures filtered by date",
                AdvancedFilterTestingDashboardWidgets.InsightWithSomeMeasuresFilteredByDate,
            ],

            [
                "insight with own date filter connected to a different date dimension than set in the widget",
                AdvancedFilterTestingDashboardWidgets.InsightConnectedToDifferentDateDimensionThanIsUsedInItsOwnFilter,
            ],
        ])("should return filters for %s", async (_, widget) => {
            const result: IFilter[] = await Tester.query(queryWidgetFilters(widget));
            expect(result).toMatchSnapshot();
        });
    });
});
