// (C) 2021-2025 GoodData Corporation

import { Dashboard } from "../../tools/dashboards";
import * as Navigation from "../../tools/navigation";
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
            dashboard.getWidgetList().should("contain", "Dependency wheel chart");
            dashboard.getWidgetList().should("contain", "Waterfall chart");

            // the internals are already covered in storybook,
            // let's just check charts were rendered
            new Widget(0, 0).getChart().isHighchartsChart();
            new Widget(1, 0).getChart().isHighchartsChart();
            new Widget(2, 0).getChart().isHighchartsChart();
            new Widget(3, 0).getChart().isHighchartsChart();
            new Widget(0, 1).getChart().isHighchartsChart();
        });
    });
});

describe(
    "Dashboard with pyramid and funnel charts",
    {
        tags: [
            "checklist_integrated_tiger_be",
            "checklist_integrated_tiger_fe",
            "checklist_integrated_tiger_releng_be",
            "checklist_integrated_tiger_releng_fe",
        ],
    },
    () => {
        beforeEach(() => {
            Navigation.visit("dashboard/dashboard-tiger-charts");
        });

        it("should render default color legend of funnel and pyramid chart correctly", () => {
            const funnelChart = new Widget(0).getChart();
            funnelChart.hasLegendColorCount(4);
            funnelChart.hasMatchingColorLegend("rgb(20, 178, 226)");

            const pyramidChart = new Widget(2).getChart();
            pyramidChart.hasLegendColorCount(3);
            pyramidChart.hasMatchingColorLegend("rgb(20, 178, 226)");
        });
    },
);
