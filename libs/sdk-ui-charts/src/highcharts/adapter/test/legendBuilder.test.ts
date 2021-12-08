// (C) 2007-2021 GoodData Corporation
import { generateChartOptions } from "../../chartTypes/_util/test/helper";

import buildLegendOptions, { getLegendItems, shouldLegendBeEnabled } from "../legendBuilder";
import { VisualizationTypes } from "@gooddata/sdk-ui";
import { ReferenceRecordings, ReferenceMd } from "@gooddata/reference-workspace";
import { measureLocalId } from "@gooddata/sdk-model";
import { recordedDataFacade } from "../../../../__mocks__/recordings";
import { DEFAULT_LEGEND_CONFIG } from "@gooddata/sdk-ui-vis-commons";

const rec = recordedDataFacade;

describe("shouldLegendBeEnabled", () => {
    it("should return false by default", () => {
        const chartOptions = generateChartOptions(
            rec(ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewBy),
        );
        expect(shouldLegendBeEnabled(chartOptions)).toBe(false);
    });

    it("should return true if chart has more than one series", () => {
        const chartOptions = generateChartOptions(
            rec(ReferenceRecordings.Scenarios.BarChart.FourMeasuresAndPoP),
        );
        expect(shouldLegendBeEnabled(chartOptions)).toBe(true);
    });

    it("should return true if pie chart has more than one value", () => {
        const chartOptions = generateChartOptions(rec(ReferenceRecordings.Scenarios.PieChart.TwoMeasures), {
            type: "pie",
        });
        expect(shouldLegendBeEnabled(chartOptions)).toBe(true);
    });

    it("should return true if the chart is stacked and has only one stack item", () => {
        const chartOptions = generateChartOptions(
            rec(
                ReferenceRecordings.Scenarios.ColumnChart
                    .SingleMeasureWithViewByAndStackByFilteredToSingleStack,
            ),
            {
                type: "column",
            },
        );
        expect(shouldLegendBeEnabled(chartOptions)).toBe(true);
    });

    it("should return true if the Line chart is stacked and has only one stack item", () => {
        const chartOptions = generateChartOptions(
            rec(
                ReferenceRecordings.Scenarios.ColumnChart
                    .SingleMeasureWithViewByAndStackByFilteredToSingleStack,
            ),
            {
                type: "line",
            },
        );
        expect(shouldLegendBeEnabled(chartOptions)).toBe(true);
    });

    it("should return false if the treemap is stacked and has only one measure item", () => {
        const dv = rec(ReferenceRecordings.Scenarios.Treemap.SingleMeasureAndSegment);
        const chartOptions = generateChartOptions(dv, { type: "treemap" });
        expect(shouldLegendBeEnabled(chartOptions)).toBe(false);
    });

    it("should return true if the treemap is stacked and has many measures", () => {
        const dv = rec(ReferenceRecordings.Scenarios.Treemap.ArithmeticMeasuresAndSegment);
        const chartOptions = generateChartOptions(dv, { type: "treemap" });
        expect(shouldLegendBeEnabled(chartOptions)).toBe(true);
    });

    it("should return true if the treemap has many measures", () => {
        const dv = rec(ReferenceRecordings.Scenarios.Treemap.TwoMeasures);
        const chartOptions = generateChartOptions(dv, { type: "treemap" });
        expect(shouldLegendBeEnabled(chartOptions)).toBe(true);
    });

    it("should return false if the treemap has only one measures", () => {
        const dv = rec(ReferenceRecordings.Scenarios.Treemap.SingleMeasure);
        const chartOptions = generateChartOptions(dv, { type: "treemap" });
        expect(shouldLegendBeEnabled(chartOptions)).toBe(false);
    });

    it("should return true if the treemap has view by and has only one view by item", () => {
        const dv = rec(ReferenceRecordings.Scenarios.Treemap.SingleMeasureAndViewByFilteredToOneElement);
        const chartOptions = generateChartOptions(dv, { type: "treemap" });
        expect(shouldLegendBeEnabled(chartOptions)).toBe(true);
    });

    it("should return true if chart is heatmap with multiple dataClasses", () => {
        const chartOptions = {
            type: VisualizationTypes.HEATMAP,
            colorAxis: {
                dataClasses: [
                    { from: 1, to: 2 },
                    { from: 2, to: 3 },
                ],
            },
        };

        expect(shouldLegendBeEnabled(chartOptions)).toEqual(true);
    });

    it("should return false when chart is heatmap with single dataClass", () => {
        const chartOptions = {
            type: VisualizationTypes.HEATMAP,
            colorAxis: {
                dataClasses: [{ from: 7, to: 7 }],
            },
        };

        expect(shouldLegendBeEnabled(chartOptions)).toEqual(false);
    });
});

describe("getLegendItems", () => {
    it("should return correct legend items for regular charts", () => {
        const chartOptions = generateChartOptions(
            rec(ReferenceRecordings.Scenarios.BarChart.TwoMeasuresWithViewBy),
        );
        expect(getLegendItems(chartOptions)).toEqual([
            {
                color: "rgb(20,178,226)",
                legendIndex: 0,
                name: "Amount",
                yAxis: 0,
            },
            {
                color: "rgb(0,193,141)",
                legendIndex: 1,
                name: "Won",
                yAxis: 0,
            },
        ]);
    });

    it("should return correct legend items for dual axis charts", () => {
        const config = {
            type: "column",
            secondary_yaxis: {
                measures: [measureLocalId(ReferenceMd.Won)],
            },
        };
        const chartOptions = generateChartOptions(
            rec(ReferenceRecordings.Scenarios.BarChart.TwoMeasuresWithViewBy),
            config,
        );
        expect(getLegendItems(chartOptions)).toEqual([
            {
                color: "rgb(20,178,226)",
                legendIndex: 0,
                name: "Amount",
                yAxis: 0,
            },
            {
                color: "rgb(0,193,141)",
                legendIndex: 1,
                name: "Won",
                yAxis: 1,
            },
        ]);
    });

    it("should return correct legend items for charts with stackBy and viewBy", () => {
        // dataset with one measure
        const chartOptions = generateChartOptions(
            rec(ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewByAndStackBy),
        );
        expect(getLegendItems(chartOptions)).toEqual([
            {
                color: "rgb(20,178,226)",
                legendIndex: 0,
                name: "East Coast",
                yAxis: 0,
            },
            {
                color: "rgb(0,193,141)",
                legendIndex: 1,
                name: "West Coast",
                yAxis: 0,
            },
        ]);
    });

    it("should return correct legend items for pie charts", () => {
        const chartOptions = generateChartOptions(rec(ReferenceRecordings.Scenarios.PieChart.TwoMeasures), {
            type: "pie",
        });
        expect(getLegendItems(chartOptions)).toEqual([
            {
                color: "rgb(20,178,226)",
                legendIndex: 0,
                name: "Amount",
            },
            {
                color: "rgb(0,193,141)",
                legendIndex: 1,
                name: "Won",
            },
        ]);
    });

    it("should return correct legend items for heatmap", () => {
        const chartOptions = {
            type: VisualizationTypes.HEATMAP,
            colorAxis: {
                dataClasses: [
                    {
                        from: 0,
                        to: 10,
                        color: "color1",
                    },
                    {
                        from: 0.5,
                        to: 0.8,
                        color: "color2",
                    },
                ],
            },
        };

        const expectedItems = [
            {
                range: { from: 0, to: 10 },
                color: "color1",
                legendIndex: 0,
            },
            {
                range: { from: 0.5, to: 0.8 },
                color: "color2",
                legendIndex: 1,
            },
        ];

        expect(getLegendItems(chartOptions)).toEqual(expectedItems);
    });
});

describe("getLegend", () => {
    const chartOptions = generateChartOptions(rec(ReferenceRecordings.Scenarios.BarChart.ArithmeticMeasures));
    const legend = buildLegendOptions({}, chartOptions);

    it("should assign enabled: false if disabled by config", () => {
        const disabledLegend = buildLegendOptions({ enabled: false }, chartOptions);
        expect(disabledLegend.enabled).toBe(false);
    });

    it("should assign enabled: true for multi metric graph", () => {
        expect(legend.enabled).toBe(true);
    });

    it("should assign default position", () => {
        expect(legend.position).toBe(DEFAULT_LEGEND_CONFIG.position);
    });

    it("should be able to override default position", () => {
        const legendWithCustomPosition = buildLegendOptions({ position: "left" }, chartOptions);
        expect(legendWithCustomPosition.position).toBe("left");
    });

    it("should assign items", () => {
        const legendItems = getLegendItems(chartOptions);
        expect(legend.items).toEqual(legendItems);
    });
});
