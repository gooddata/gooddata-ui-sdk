// (C) 2021 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { Widget } from "../../tools/widget";

describe("Dashboard Shorten Metric Name", { tags: ["checklist_integrated_tiger"] }, () => {
    beforeEach(() => {
        Navigation.visit("dashboard/shorten-metric-name");
    });

    it("Table should shorten metric name", () => {
        const table = new Widget(0).getTable();
        table.waitLoaded();
        table.assertShortenMetricName(496);
        /*    });

    it("Column chart should shorten metric name in legend", () => {*/
        const chart = new Widget(1).getChart();
        chart.waitLoaded();
        chart.assertShortenMetricNameInLegend(176);
        chart.hoverOnChart1stPointInHigh();
        chart.assertShortenMetricNameInTooltip(299.9912109375);
    });
});
