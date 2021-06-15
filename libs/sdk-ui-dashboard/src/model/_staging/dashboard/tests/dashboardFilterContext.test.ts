// (C) 2021 GoodData Corporation

import { dashboardFilterContextDefinition } from "../dashboardFilterContext";
import {
    EmptyDashboardWithReferences,
    SimpleDashboardWithReferences,
} from "../../../tests/Dashboard.fixtures";
import { defaultDateFilterConfig } from "../../dateFilterConfig/defaultConfig";

describe("dashboardFilterContextDefinition", () => {
    it("should return default filter context when dashboard does not have one", () => {
        const filterContext = dashboardFilterContextDefinition(
            EmptyDashboardWithReferences.dashboard,
            defaultDateFilterConfig,
        );

        expect(filterContext.ref).toBeUndefined();
        expect(filterContext.filters).toBeDefined();
    });

    it("should retain filter context if included in the dashboard", () => {
        const filterContext = dashboardFilterContextDefinition(
            SimpleDashboardWithReferences.dashboard,
            defaultDateFilterConfig,
        );

        expect(filterContext).toEqual(SimpleDashboardWithReferences.dashboard.filterContext);
    });
});
