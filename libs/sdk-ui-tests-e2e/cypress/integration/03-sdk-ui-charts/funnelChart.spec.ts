// (C) 2021-2025 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { Chart } from "../../tools/chart";

describe(
    "Funnel Chart",
    { tags: ["checklist_integrated_tiger", "checklist_integrated_tiger_releng"] },
    () => {
        beforeEach(() => {
            Navigation.visit("visualizations/funnelchart/funnel-chart-scenario");
        });

        it(`check default sort of funnel chart`, () => {
            const chart = new Chart(".s-funnel-chart");
            chart.waitLoaded();
            chart.hasLegendColorCount(8);
            chart.hasMatchingPercentageLabels([
                /\$42,470,571\.16 \(100%\)/,
                /\$38,310,753\.45 \(90%\)/,
                /\$18,447,266\.14 \(43%\)/,
                /\$5,612,062\.60 \(13%\)/,
                /\$4,249,027\.88 \(10%\)/,
                /\$3,067,466\.12 \(7%\)/,
                /\$2,606,293\.46 \(6%\)/,
                /\$1,862,015\.73 \(4%\)/,
            ]);
        });
    },
);
