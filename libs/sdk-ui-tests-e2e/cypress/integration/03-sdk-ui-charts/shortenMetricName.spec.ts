// (C) 2023-2025 GoodData Corporation
import { Chart } from "../../tools/chart";
import * as Navigation from "../../tools/navigation";
import { Table } from "../../tools/table";

const LEGEND_NAME_CSS = ".series-name";
const TOOLTIP_TITLE_CSS = ".gd-viz-tooltip-title";

describe("Shorten Metric Name", { tags: ["checklist_integrated_tiger"] }, () => {
    it(`check shorten in legend and tooltip in chart`, () => {
        Navigation.visit("visualizations/shortenmetricname/shorten-metric-name-chart-scenario");
        const chart = new Chart(".s-column-chart");
        chart.waitLoaded();
        chart.assertShortenMetricName(LEGEND_NAME_CSS, 176);
        chart.clickSeriesPoint(0);
        chart.assertShortenMetricName(TOOLTIP_TITLE_CSS, 300);
    });

    it.skip(`check shorten metric name in table`, () => {
        Navigation.visit("visualizations/shortenmetricname/shorten-metric-name-table-scenario");
        const table = new Table(".s-pivot-table");
        table.waitLoaded();
        table.hasHeaderColumnWidth(1352);
    });
});
