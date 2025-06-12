// (C) 2023-2025 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { Widget } from "../../tools/widget";

const LEGEND_NAME_CSS = ".series-name";
const TOOLTIP_TITLE_CSS = ".gd-viz-tooltip-title";

describe(
    "Dashboard Shorten Metric Name",
    { tags: ["checklist_integrated_tiger", "checklist_integrated_tiger_releng"] },
    () => {
        beforeEach(() => {
            Navigation.visit("dashboard/shorten-metric-name");
        });

        it("Table should shorten metric name", () => {
            const table = new Widget(0).waitTableLoaded();
            table.getTable().assertShortenMetricName(496);
        });

        it("Column chart should shorten metric name in legend", () => {
            const chart = new Widget(1).waitChartLoaded().getChart();
            chart.assertShortenMetricName(LEGEND_NAME_CSS, 176);
            chart.hoverOnHighChartSeries(0);
            chart.hasTooltipTitleWidth(TOOLTIP_TITLE_CSS, 300);
        });
    },
);
