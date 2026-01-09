// (C) 2024-2026 GoodData Corporation

import { Chart } from "../../tools/chart";
import * as Navigation from "../../tools/navigation";

describe("Scatter Plot", { tags: ["pre-merge_isolated_tiger_fe"] }, () => {
    it("should group points by segment and customize color", () => {
        Navigation.visit("visualizations/scatterplot/segmentation");
        const chart = new Chart(".s-scatter-plot");
        chart
            .waitLoaded()
            .waitComputed()
            .verifyTotalPointsOfChart(0, 5)
            .hasScatterSerieColor(0, "rgb(4,140,103)")
            .hasScatterSerieColor(1, "rgb(163,101,46)")
            .hasScatterSerieColor(2, "rgb(181,60,51)")
            .hasScatterSerieColor(3, "rgb(4,140,103)")
            .hasScatterSerieColor(4, "rgb(163,101,46)");
    });

    it("should group points by segment", () => {
        Navigation.visit("visualizations/scatterplot/segmentation-insight-view");
        const chart = new Chart(".s-scatter-plot");
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
