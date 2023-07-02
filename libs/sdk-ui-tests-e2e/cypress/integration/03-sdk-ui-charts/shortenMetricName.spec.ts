// (C) 2021 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { Chart } from "../../tools/chart";
import { Table } from "../../tools/table";

describe("Shorten Metric Name", { tags: ["checklist_integrated_tiger"] }, () => {
    it(`check shorten in legend and tooltip in chart`, () => {
        Navigation.visit("visualizations/shortenmetricname/shorten-metric-name-chart-scenario");
        const chart = new Chart(".s-column-chart");
        chart.waitLoaded();
        chart.assertShortenMetricNameInLegend(176);
        chart.hoverOnChart1stPointInHigh();
        chart.assertShortenMetricNameInTooltip(300);
    });

    it(`check shorten metric name in table`, () => {
        Navigation.visit("visualizations/shortenmetricname/shorten-metric-name-table-scenario");
        const table = new Table(".s-pivot-table");
        table.waitLoaded();
        table.assertShortenMetricName(1360);
    });
});
