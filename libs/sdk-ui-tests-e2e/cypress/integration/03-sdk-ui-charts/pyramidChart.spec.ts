// (C) 2021-2026 GoodData Corporation

import { Chart } from "../../tools/chart";
import { visit } from "../../tools/navigation";

describe(
    "Pyramid Chart",
    {
        tags: [
            "checklist_integrated_tiger_be",
            "checklist_integrated_tiger_fe",
            "checklist_integrated_tiger_releng_be",
            "checklist_integrated_tiger_releng_fe",
        ],
    },
    () => {
        beforeEach(() => {
            visit("visualizations/pyramidchart/pyramid-chart-scenario");
        });

        it(`check default sort of pyramid chart`, () => {
            const chart = new Chart(".s-pyramid-chart");
            chart.waitLoaded();
            chart.hasLegendColorCount(8);
            chart.hasMatchingPercentageLabels([
                /\$42,470,571\.16/,
                /\$38,310,753\.45/,
                /\$18,447,266\.14/,
                /\$5,612,062\.60/,
                /\$4,249,027\.88/,
                /\$3,067,466\.12/,
                /\$2,606,293\.46/,
                /\$1,862,015\.73/,
            ]);
        });
    },
);
