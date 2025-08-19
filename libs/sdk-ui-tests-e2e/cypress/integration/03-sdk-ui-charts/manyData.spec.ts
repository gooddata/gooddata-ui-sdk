// (C) 2024-2025 GoodData Corporation
import { Chart } from "../../tools/chart";
import * as Navigation from "../../tools/navigation";

describe("Many data", { tags: ["pre-merge_isolated_tiger"] }, () => {
    it(`Should render visualization component when over data points limit`, () => {
        Navigation.visit("visualizations/manydata/pie-many-data");
        const chart = new Chart(".s-pie-chart");
        chart.waitComputed().isHighchartsChart();
    });

    it(`Should render visualization by insightView when over data points limit`, () => {
        Navigation.visit("visualizations/manydata/many-data-insight-view");
        const chart = new Chart(".s-column-chart");
        chart.waitComputed().isHighchartsChart();
    });
});
