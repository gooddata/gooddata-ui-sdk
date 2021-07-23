// (C) 2021 GoodData Corporation
import { DashboardTester, preloadedTesterFactory } from "../../tests/DashboardTester";
import {
    FilterTestingDashboardIdentifier,
    FilterTestingDashboardWidgets,
} from "../../tests/Dashboard.fixtures";
import { queryWidgetFilters } from "../../queries";
import { IFilter } from "@gooddata/sdk-model";
import { IWidget } from "@gooddata/sdk-backend-spi";

describe("query widget filters", () => {
    let Tester: DashboardTester;
    beforeEach(preloadedTesterFactory((tester) => (Tester = tester), FilterTestingDashboardIdentifier));

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
