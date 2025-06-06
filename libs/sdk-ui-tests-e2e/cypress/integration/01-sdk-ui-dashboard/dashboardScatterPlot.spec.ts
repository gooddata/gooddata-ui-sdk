// (C) 2024-2025 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { Chart } from "../../tools/chart";

describe("Scatter Plot - Segmentation", { tags: ["pre-merge_isolated_tiger"] }, () => {
    it("should grouped points by segmentation", () => {
        Navigation.visit("dashboard/dashboard-scatter-plot-segmentation");
        const chart = new Chart(".s-dash-item-0_0");
        chart
            .waitLoaded()
            .waitComputed()
            .verifyTotalPointsOfChart(0, 5)
            .hasScatterSerieColor(0, "rgb(20,178,226)")
            .hasScatterSerieColor(1, "rgb(0,193,141)")
            .hasScatterSerieColor(2, "rgb(20,178,226)")
            .hasScatterSerieColor(3, "rgb(0,193,141)")
            .hasScatterSerieColor(4, "rgb(20,178,226)");
    });
});
