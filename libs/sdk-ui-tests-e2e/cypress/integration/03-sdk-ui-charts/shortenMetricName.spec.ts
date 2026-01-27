// (C) 2023-2026 GoodData Corporation

import { Chart } from "../../tools/chart";
import { visit } from "../../tools/navigation";
import { TableNew } from "../../tools/tableNew";

const LEGEND_NAME_CSS = ".series-name";
const TOOLTIP_TITLE_CSS = ".gd-viz-tooltip-title";

describe(
    "Shorten Metric Name",
    { tags: ["checklist_integrated_tiger_be", "checklist_integrated_tiger_fe"] },
    () => {
        it(`check shorten in legend and tooltip in chart`, () => {
            visit("visualizations/shortenmetricname/shorten-metric-name-chart-scenario");
            const chart = new Chart(".s-column-chart");
            chart.waitLoaded();
            chart.assertShortenMetricName(LEGEND_NAME_CSS, 176);
            chart.clickSeriesPoint(0);
            chart.assertShortenMetricName(TOOLTIP_TITLE_CSS, 300);
        });

        it(`check shorten metric name in table`, () => {
            visit("visualizations/shortenmetricname/shorten-metric-name-table-scenario");
            const table = new TableNew(".s-pivot-table");
            table.waitLoaded();
            table.hasHeaderColumnWidth(1352);
        });
    },
);
