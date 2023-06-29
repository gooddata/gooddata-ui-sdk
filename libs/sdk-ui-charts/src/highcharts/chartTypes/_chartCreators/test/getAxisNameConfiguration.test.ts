// (C) 2019-2021 GoodData Corporation
import { VisualizationTypes } from "@gooddata/sdk-ui";

import { getAxisNameConfiguration } from "../getAxisNameConfiguration.js";
import { IChartOptions } from "../../../typings/unsafe.js";
import { ROTATE_NEGATIVE_90_DEGREES, ALIGN_LEFT, ALIGN_RIGHT } from "../../../constants/axisLabel.js";
import { IAxisConfig } from "../../../../interfaces/index.js";
import { describe, it, expect } from "vitest";

describe("getAxisNameConfiguration", () => {
    it("should return highchart axis config", () => {
        const chartOptions: IChartOptions = {
            xAxes: [{ label: "xAxes" }, { label: "xAxes2", opposite: true }],
            xAxisProps: {
                name: {
                    position: "low",
                    visible: false,
                },
            },
            secondary_xAxisProps: {
                name: {},
            },
            yAxes: [{ label: "yAxes" }, { label: "yAxes2", opposite: true }],
            yAxisProps: {
                name: {
                    position: "middle",
                    visible: true,
                },
            },
            secondary_yAxisProps: {
                name: {
                    position: "high",
                },
            },
        };

        const axisNameConfig = getAxisNameConfiguration(chartOptions);
        expect(axisNameConfig).toEqual({
            xAxis: [
                {
                    title: {
                        align: "low",
                        text: "",
                    },
                },
                {
                    title: {},
                },
            ],
            yAxis: [
                {
                    title: {
                        align: "middle",
                    },
                },
                {
                    title: {
                        align: "high",
                    },
                },
            ],
        });
    });

    it.each([
        [
            VisualizationTypes.COMBO,
            {
                type: VisualizationTypes.COMBO,
                xAxes: [{ label: "xAxes" }, { label: "xAxes", opposite: true }],
                yAxes: [{ label: "yAxes" }, { label: "yAxes2", opposite: true }],
            },
        ],
        [
            VisualizationTypes.COMBO2,
            {
                type: VisualizationTypes.COMBO2,
                xAxes: [{ label: "xAxes" }, { label: "xAxes", opposite: true }],
                yAxes: [{ label: "yAxes" }, { label: "yAxes2", opposite: true }],
            },
        ],
        [
            VisualizationTypes.COLUMN,
            {
                type: VisualizationTypes.COLUMN,
                xAxes: [{ label: "xAxes" }, { label: "xAxes", opposite: true }],
                yAxes: [{ label: "yAxes" }, { label: "yAxes2", opposite: true }],
            },
        ],
        [
            VisualizationTypes.LINE,
            {
                type: VisualizationTypes.LINE,
                xAxes: [{ label: "xAxes" }, { label: "xAxes", opposite: true }],
                yAxes: [{ label: "yAxes" }, { label: "yAxes2", opposite: true }],
            },
        ],
    ])(
        "should return highchart axis config for %s chart with rotated opposite Y axis label",
        (_, chartOptions: IChartOptions) => {
            const axisNameConfig = getAxisNameConfiguration(chartOptions);
            expect(axisNameConfig).toEqual({
                xAxis: [
                    {
                        title: {},
                    },
                    {
                        title: {},
                    },
                ],
                yAxis: [
                    {
                        title: {},
                    },
                    {
                        title: { rotation: Number(ROTATE_NEGATIVE_90_DEGREES) },
                    },
                ],
            });
        },
    );

    const axisPositionLow: IAxisConfig = { name: { position: "low" } };
    it.each([
        [
            VisualizationTypes.COMBO,
            {
                type: VisualizationTypes.COMBO,
                xAxes: [{ label: "xAxes" }, { label: "xAxes", opposite: true }],
                yAxes: [{ label: "yAxes" }, { label: "yAxes2", opposite: true }],
                secondary_yAxisProps: axisPositionLow,
            },
        ],
        [
            VisualizationTypes.COMBO2,
            {
                type: VisualizationTypes.COMBO2,
                xAxes: [{ label: "xAxes" }, { label: "xAxes", opposite: true }],
                yAxes: [{ label: "yAxes" }, { label: "yAxes2", opposite: true }],
                secondary_yAxisProps: axisPositionLow,
            },
        ],
        [
            VisualizationTypes.COLUMN,
            {
                type: VisualizationTypes.COLUMN,
                xAxes: [{ label: "xAxes" }, { label: "xAxes", opposite: true }],
                yAxes: [{ label: "yAxes" }, { label: "yAxes2", opposite: true }],
                secondary_yAxisProps: axisPositionLow,
            },
        ],
        [
            VisualizationTypes.LINE,
            {
                type: VisualizationTypes.LINE,
                xAxes: [{ label: "xAxes" }, { label: "xAxes", opposite: true }],
                yAxes: [{ label: "yAxes" }, { label: "yAxes2", opposite: true }],
                secondary_yAxisProps: axisPositionLow,
            },
        ],
    ])(
        "should return highchart axis config for %s chart with left low aligned rotated opposite Y axis label",
        (_, chartOptions: IChartOptions) => {
            const axisNameConfig = getAxisNameConfiguration(chartOptions);
            expect(axisNameConfig).toEqual({
                xAxis: [
                    {
                        title: {},
                    },
                    {
                        title: {},
                    },
                ],
                yAxis: [
                    {
                        title: {},
                    },
                    {
                        title: {
                            align: "low",
                            rotation: Number(ROTATE_NEGATIVE_90_DEGREES),
                            textAlign: ALIGN_LEFT,
                        },
                    },
                ],
            });
        },
    );

    const axisPositionHigh: IAxisConfig = { name: { position: "high" } };
    it.each([
        [
            VisualizationTypes.COMBO,
            {
                type: VisualizationTypes.COMBO,
                xAxes: [{ label: "xAxes" }, { label: "xAxes", opposite: true }],
                yAxes: [{ label: "yAxes" }, { label: "yAxes2", opposite: true }],
                secondary_yAxisProps: axisPositionHigh,
            },
        ],
        [
            VisualizationTypes.COMBO2,
            {
                type: VisualizationTypes.COMBO2,
                xAxes: [{ label: "xAxes" }, { label: "xAxes", opposite: true }],
                yAxes: [{ label: "yAxes" }, { label: "yAxes2", opposite: true }],
                secondary_yAxisProps: axisPositionHigh,
            },
        ],
        [
            VisualizationTypes.COLUMN,
            {
                type: VisualizationTypes.COLUMN,
                xAxes: [{ label: "xAxes" }, { label: "xAxes", opposite: true }],
                yAxes: [{ label: "yAxes" }, { label: "yAxes2", opposite: true }],
                secondary_yAxisProps: axisPositionHigh,
            },
        ],
        [
            VisualizationTypes.LINE,
            {
                type: VisualizationTypes.LINE,
                xAxes: [{ label: "xAxes" }, { label: "xAxes", opposite: true }],
                yAxes: [{ label: "yAxes" }, { label: "yAxes2", opposite: true }],
                secondary_yAxisProps: axisPositionHigh,
            },
        ],
    ])(
        "should return highchart axis config for %s chart with right high aligned rotated opposite Y axis label",
        (_, chartOptions: IChartOptions) => {
            const axisNameConfig = getAxisNameConfiguration(chartOptions);
            expect(axisNameConfig).toEqual({
                xAxis: [
                    {
                        title: {},
                    },
                    {
                        title: {},
                    },
                ],
                yAxis: [
                    {
                        title: {},
                    },
                    {
                        title: {
                            align: "high",
                            rotation: Number(ROTATE_NEGATIVE_90_DEGREES),
                            textAlign: ALIGN_RIGHT,
                        },
                    },
                ],
            });
        },
    );

    it("should return highchart axis config for bar chart without rotated opposite Y axis label", () => {
        const chartOptions: IChartOptions = {
            type: VisualizationTypes.BAR,
            xAxes: [{ label: "xAxes" }, { label: "xAxes", opposite: true }],
            yAxes: [{ label: "yAxes" }, { label: "yAxes2", opposite: true }],
        };

        const axisNameConfig = getAxisNameConfiguration(chartOptions);
        expect(axisNameConfig).toEqual({
            xAxis: [
                {
                    title: {},
                },
                {
                    title: {},
                },
            ],
            yAxis: [
                {
                    title: {},
                },
                {
                    title: {},
                },
            ],
        });
    });
});
