// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { ReferenceMd, ReferenceRecordings } from "@gooddata/reference-workspace";
import { type ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";
import { measureLocalId } from "@gooddata/sdk-model";
import { DataViewFacade, VisualizationTypes } from "@gooddata/sdk-ui";
import { DEFAULT_LEGEND_CONFIG, type ISeriesItemMetric } from "@gooddata/sdk-ui-vis-commons";

import { recordedDataFacade } from "../../testUtils/recordings.fixture.js";
import { generateChartOptions } from "../chartTypes/_util/helper.js";
import { type IChartOptions } from "../typings/unsafe.js";

import { buildLegendOptions, getLegendItems, shouldLegendBeEnabled } from "./legendBuilder.js";

const rec = recordedDataFacade;

describe("shouldLegendBeEnabled", () => {
    it("should return false by default", () => {
        const chartOptions = generateChartOptions(
            rec(
                ReferenceRecordings.Scenarios.BarChart
                    .SingleMeasureWithViewBy as unknown as ScenarioRecording,
            ),
        );
        expect(shouldLegendBeEnabled(chartOptions)).toBe(false);
    });

    it("should return true if chart has more than one series", () => {
        const chartOptions = generateChartOptions(
            rec(ReferenceRecordings.Scenarios.BarChart.FourMeasuresAndPoP as unknown as ScenarioRecording),
        );
        expect(shouldLegendBeEnabled(chartOptions)).toBe(true);
    });

    it("should return true if pie chart has more than one value", () => {
        const chartOptions = generateChartOptions(
            rec(ReferenceRecordings.Scenarios.PieChart.TwoMeasures as unknown as ScenarioRecording),
            {
                type: "pie",
            },
        );
        expect(shouldLegendBeEnabled(chartOptions)).toBe(true);
    });

    it("should return true if the chart is stacked and has only one stack item", () => {
        const chartOptions = generateChartOptions(
            rec(
                ReferenceRecordings.Scenarios.ColumnChart
                    .SingleMeasureWithViewByAndStackByFilteredToSingleStack as unknown as ScenarioRecording,
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
                    .SingleMeasureWithViewByAndStackByFilteredToSingleStack as unknown as ScenarioRecording,
            ),
            {
                type: "line",
            },
        );
        expect(shouldLegendBeEnabled(chartOptions)).toBe(true);
    });

    it("should return false if the treemap is stacked and has only one measure item", () => {
        const dv = rec(
            ReferenceRecordings.Scenarios.Treemap.SingleMeasureAndSegment as unknown as ScenarioRecording,
        );
        const chartOptions = generateChartOptions(dv, { type: "treemap" });
        expect(shouldLegendBeEnabled(chartOptions)).toBe(false);
    });

    it("should return true if the treemap is stacked and has many measures", () => {
        const dv = rec(
            ReferenceRecordings.Scenarios.Treemap
                .ArithmeticMeasuresAndSegment as unknown as ScenarioRecording,
        );
        const chartOptions = generateChartOptions(dv, { type: "treemap" });
        expect(shouldLegendBeEnabled(chartOptions)).toBe(true);
    });

    it("should return true if the treemap has many measures", () => {
        const dv = rec(ReferenceRecordings.Scenarios.Treemap.TwoMeasures as unknown as ScenarioRecording);
        const chartOptions = generateChartOptions(dv, { type: "treemap" });
        expect(shouldLegendBeEnabled(chartOptions)).toBe(true);
    });

    it("should return false if the treemap has only one measures", () => {
        const dv = rec(ReferenceRecordings.Scenarios.Treemap.SingleMeasure as unknown as ScenarioRecording);
        const chartOptions = generateChartOptions(dv, { type: "treemap" });
        expect(shouldLegendBeEnabled(chartOptions)).toBe(false);
    });

    it("should return true if the treemap has view by and has only one view by item", () => {
        const dv = rec(
            ReferenceRecordings.Scenarios.Treemap
                .SingleMeasureAndViewByFilteredToOneElement as unknown as ScenarioRecording,
        );
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
    it.each(["clusterName", "segmentName"])(
        "should preserve scatter plot legend indices for %s when indices are not consecutive",
        (nameProperty) => {
            const chartOptions = {
                type: VisualizationTypes.SCATTER,
                data: {
                    series: [
                        {
                            data: [
                                { [nameProperty]: "B", color: "green", legendIndex: 3 },
                                { [nameProperty]: "A", color: "blue", legendIndex: 1 },
                                { [nameProperty]: "B", color: "green", legendIndex: 3 },
                            ],
                        },
                    ],
                },
            } as IChartOptions;

            expect(getLegendItems(chartOptions, undefined)).toEqual([
                { type: "scatter", isVisible: true, name: "A", color: "blue", legendIndex: 1 },
                { type: "scatter", isVisible: true, name: "B", color: "green", legendIndex: 3 },
            ]);
        },
    );

    it.each([0, 1, 2, null])(
        "should keep legend indices aligned after removing NULL coordinates from cluster %s",
        (missingCluster) => {
            const dv = rec(
                ReferenceRecordings.Scenarios.ScatterPlot
                    .XAndYAxisMeasuresAndAttributeWithNullsInData as unknown as ScenarioRecording,
            );
            const rows = dv.rawData().twoDimData();
            const visibleClusters = [0, 1, 2].filter((cluster) => cluster !== missingCluster);
            const clusters = rows.map((row, index) =>
                row.some((value) => value === null)
                    ? missingCluster
                    : visibleClusters[index % visibleClusters.length],
            );
            const dataView = dv.dataView.withClustering(
                { numberOfClusters: 3 },
                {
                    attribute: rows.map((_, index) => `${index}`),
                    clusters,
                    xcoord: rows.map((row) => (row[0] === null ? null : Number(row[0]))),
                    ycoord: rows.map((row) => (row[1] === null ? null : Number(row[1]))),
                },
            );
            const chartOptions = generateChartOptions(DataViewFacade.for(dataView), { type: "scatter" });
            const points = chartOptions.data!.series![0].data!;
            const legendItems = getLegendItems(chartOptions, undefined) as ISeriesItemMetric[];

            expect(points).toHaveLength(3);
            expect(legendItems).toHaveLength(visibleClusters.length);
            for (const point of points) {
                const legendItem = legendItems.find((item) => item.color === point.color);
                expect(legendItem?.legendIndex).toBe(point.legendIndex);
            }
        },
    );

    it("should name sankey legend items by the node name, falling back to the node id", () => {
        const chartOptions = {
            type: "sankey",
            data: {
                series: [
                    {
                        nodes: [
                            { id: "1.234", name: "1.23", color: "red" },
                            { id: "A", color: "blue" },
                        ],
                    },
                ],
            },
        } as unknown as IChartOptions;

        expect(getLegendItems(chartOptions, undefined)).toEqual([
            { name: "1.23", color: "red", legendIndex: 0 },
            { name: "A", color: "blue", legendIndex: 1 },
        ]);
    });

    it("should return correct legend items for regular charts", () => {
        const chartOptions = generateChartOptions(
            rec(ReferenceRecordings.Scenarios.BarChart.TwoMeasuresWithViewBy as unknown as ScenarioRecording),
        );
        expect(getLegendItems(chartOptions, undefined)).toEqual([
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
            rec(ReferenceRecordings.Scenarios.BarChart.TwoMeasuresWithViewBy as unknown as ScenarioRecording),
            config,
        );
        expect(getLegendItems(chartOptions, undefined)).toEqual([
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
            rec(
                ReferenceRecordings.Scenarios.BarChart
                    .SingleMeasureWithViewByAndStackBy as unknown as ScenarioRecording,
            ),
        );
        expect(getLegendItems(chartOptions, undefined)).toEqual([
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
        const chartOptions = generateChartOptions(
            rec(ReferenceRecordings.Scenarios.PieChart.TwoMeasures as unknown as ScenarioRecording),
            {
                type: "pie",
            },
        );
        expect(getLegendItems(chartOptions, undefined)).toEqual([
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
                type: "heatmap",
                range: { from: 0, to: 10 },
                color: "color1",
                legendIndex: 0,
            },
            {
                type: "heatmap",
                range: { from: 0.5, to: 0.8 },
                color: "color2",
                legendIndex: 1,
            },
        ];

        expect(getLegendItems(chartOptions, undefined)).toEqual(expectedItems);
    });
});

describe("getLegend", () => {
    const chartOptions = generateChartOptions(
        rec(ReferenceRecordings.Scenarios.BarChart.ArithmeticMeasures as unknown as ScenarioRecording),
    );
    const legend = buildLegendOptions({}, chartOptions, undefined);

    it("should assign enabled: false if disabled by config", () => {
        const disabledLegend = buildLegendOptions({ enabled: false }, chartOptions, undefined);
        expect(disabledLegend.enabled).toBe(false);
    });

    it("should assign enabled: true for multi metric graph", () => {
        expect(legend.enabled).toBe(true);
    });

    it("should assign default position", () => {
        expect(legend.position).toBe(DEFAULT_LEGEND_CONFIG.position);
    });

    it("should be able to override default position", () => {
        const legendWithCustomPosition = buildLegendOptions({ position: "left" }, chartOptions, undefined);
        expect(legendWithCustomPosition.position).toBe("left");
    });

    it("should assign items", () => {
        const legendItems = getLegendItems(chartOptions, undefined);
        expect(legend.items).toEqual(legendItems);
    });
});
