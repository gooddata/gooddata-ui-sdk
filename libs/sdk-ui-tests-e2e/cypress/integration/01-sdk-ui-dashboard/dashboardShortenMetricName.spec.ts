// (C) 2023 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { Widget } from "../../tools/widget";

const LEGEND_NAME_CSS = ".series-name";
const TOOLTIP_TITLE_CSS = ".gd-viz-tooltip-title";

describe("Dashboard Shorten Metric Name", { tags: ["checklist_integrated_tiger"] }, () => {
    beforeEach(() => {
        Navigation.visit("dashboard/shorten-metric-name");
    });

    it("Table should shorten metric name", () => {
        const table = new Widget(0).getTable();
        table.waitLoaded();
        table.assertShortenMetricName(496);
    });

    it("Column chart should shorten metric name in legend", () => {
        const chart = new Widget(1).getChart();
        chart.waitLoaded();
        chart.assertShortenMetricName(LEGEND_NAME_CSS, 176);
        chart.clickSeriesPoint(0);
        chart.assertShortenMetricName(TOOLTIP_TITLE_CSS, 299.982421875);
    });
});
