// (C) 2021 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { Dashboard } from "../../tools/dashboards";
import { Widget } from "../../tools/widget";

describe("Dashboard with charts", { tags: ["pre-merge_isolated_tiger"] }, () => {
    describe("rendering", () => {
        beforeEach(() => {
            Navigation.visit("dashboard/dashboard-tiger-charts");
        });

        it("should render charts", () => {
            const dashboard = new Dashboard();
            dashboard.getWidgetList().should("contain", "Funnel chart");
            dashboard.getWidgetList().should("contain", "Pyramid chart");
            dashboard.getWidgetList().should("contain", "Sankey chart");

            // the internals are already covered in storybook,
            // let's just check charts were rendered
            new Widget(0).getChart().isHighchartsChart();
            new Widget(1).getChart().isHighchartsChart();
            new Widget(2).getChart().isHighchartsChart();
        });
    });
});
