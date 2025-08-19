// (C) 2019-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { VisualizationTypes } from "@gooddata/sdk-ui";

import { IChartOptions } from "../../../typings/unsafe.js";
import { getAxisLabelConfigurationForDualBarChart } from "../getAxisLabelConfigurationForDualBarChart.js";

describe("getAxisLabelConfigurationForDualBarChart", () => {
    it("should return empty axis label config on single bar chart", () => {
        const chartOptions: IChartOptions = {
            type: VisualizationTypes.BAR,
            yAxes: [{ label: "" }],
        };
        const axisConfig = getAxisLabelConfigurationForDualBarChart(chartOptions);
        expect(axisConfig).toEqual({});
    });

    it("should return empty axis label config on not dual bar chart", () => {
        const chartOptions: IChartOptions = {
            type: VisualizationTypes.COLUMN,
            yAxes: [{ label: "" }, { label: "" }],
        };
        const axisConfig = getAxisLabelConfigurationForDualBarChart(chartOptions);
        expect(axisConfig).toEqual({});
    });

    it("should return empty Y axis label config on not-90-rotation bar chart", () => {
        const chartOptions: IChartOptions = {
            type: VisualizationTypes.BAR,
            yAxes: [{ label: "" }, { label: "" }],
        };
        const axisConfig = getAxisLabelConfigurationForDualBarChart(chartOptions);
        expect(axisConfig).toEqual({ yAxis: [undefined, undefined] });
    });

    it.each([
        [
            "bottom",
            {
                yAxisProps: {
                    rotation: "90",
                },
                secondary_yAxisProps: {
                    rotation: "30",
                },
            },
            [
                {
                    labels: {
                        align: "right",
                        y: 8,
                    },
                },
                undefined,
            ],
        ],
        [
            "top",
            {
                yAxisProps: {
                    rotation: "30",
                },
                secondary_yAxisProps: {
                    rotation: "90",
                },
            },
            [
                undefined,
                {
                    labels: {
                        align: "left",
                        y: undefined,
                    },
                },
            ],
        ],
        [
            "top and bottom with 90 rotation",
            {
                yAxisProps: {
                    rotation: "90",
                },
                secondary_yAxisProps: {
                    rotation: "90",
                },
            },
            [
                {
                    labels: {
                        align: "right",
                        y: 8,
                    },
                },
                {
                    labels: {
                        align: "left",
                        y: undefined,
                    },
                },
            ],
        ],
        [
            "top and bottom with -90 rotation",
            {
                yAxisProps: {
                    rotation: "-90",
                },
                secondary_yAxisProps: {
                    rotation: "-90",
                },
            },
            [
                {
                    labels: {
                        align: "left",
                        y: 8,
                    },
                },
                {
                    labels: {
                        align: "right",
                        y: undefined,
                    },
                },
            ],
        ],
        [
            "top and bottom with 60 rotation",
            {
                yAxisProps: {
                    rotation: "60",
                },
                secondary_yAxisProps: {
                    rotation: "60",
                },
            },
            [
                {
                    labels: {
                        align: "right",
                        y: 8,
                    },
                },
                {
                    labels: {
                        align: "left",
                        y: undefined,
                    },
                },
            ],
        ],
        [
            "top and bottom with -60 rotation",
            {
                yAxisProps: {
                    rotation: "-60",
                },
                secondary_yAxisProps: {
                    rotation: "-60",
                },
            },
            [
                {
                    labels: {
                        align: "left",
                        y: 8,
                    },
                },
                {
                    labels: {
                        align: "right",
                        y: undefined,
                    },
                },
            ],
        ],
    ])(
        "should return Y axis label config of %s axis on bar chart",
        (_axisPosition: any, axisPropsOptions: any, expectedConfig: any) => {
            const chartOptions: IChartOptions = {
                type: VisualizationTypes.BAR,
                yAxes: [{}, {}],
                ...axisPropsOptions,
            };
            const axisConfig = getAxisLabelConfigurationForDualBarChart(chartOptions);
            expect(axisConfig).toEqual({
                yAxis: expectedConfig,
            });
        },
    );
});
