// (C) 2019-2020 GoodData Corporation
import { VisualizationTypes } from "@gooddata/sdk-ui";

import { getAxisNameConfiguration } from "../getAxisNameConfiguration";
import { IChartOptions } from "../../../typings/unsafe";
import { ROTATE_NEGATIVE_90_DEGREES, ALIGN_LEFT, ALIGN_RIGHT } from "../../../constants/axisLabel";

describe("getAxisNameConfiguration", () => {
    it("should return highchart axis config", () => {
        const chartOptions: IChartOptions = {
            xAxes: [{}, { opposite: true }],
            xAxisProps: {
                name: {
                    position: "low",
                    visible: false,
                },
            },
            secondary_xAxisProps: {
                name: {},
            },
            yAxes: [{}, { opposite: true }],
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
                xAxes: [{}, { opposite: true }],
                yAxes: [{}, { opposite: true }],
            },
        ],
        [
            VisualizationTypes.COMBO2,
            {
                type: VisualizationTypes.COMBO2,
                xAxes: [{}, { opposite: true }],
                yAxes: [{}, { opposite: true }],
            },
        ],
        [
            VisualizationTypes.COLUMN,
            {
                type: VisualizationTypes.COLUMN,
                xAxes: [{}, { opposite: true }],
                yAxes: [{}, { opposite: true }],
            },
        ],
        [
            VisualizationTypes.LINE,
            {
                type: VisualizationTypes.LINE,
                xAxes: [{}, { opposite: true }],
                yAxes: [{}, { opposite: true }],
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

    it.each([
        [
            VisualizationTypes.COMBO,
            {
                type: VisualizationTypes.COMBO,
                xAxes: [{}, { opposite: true }],
                yAxes: [{}, { opposite: true }],
                secondary_yAxisProps: { name: { position: "low" } },
            },
        ],
        [
            VisualizationTypes.COMBO2,
            {
                type: VisualizationTypes.COMBO2,
                xAxes: [{}, { opposite: true }],
                yAxes: [{}, { opposite: true }],
                secondary_yAxisProps: { name: { position: "low" } },
            },
        ],
        [
            VisualizationTypes.COLUMN,
            {
                type: VisualizationTypes.COLUMN,
                xAxes: [{}, { opposite: true }],
                yAxes: [{}, { opposite: true }],
                secondary_yAxisProps: { name: { position: "low" } },
            },
        ],
        [
            VisualizationTypes.LINE,
            {
                type: VisualizationTypes.LINE,
                xAxes: [{}, { opposite: true }],
                yAxes: [{}, { opposite: true }],
                secondary_yAxisProps: { name: { position: "low" } },
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

    it.each([
        [
            VisualizationTypes.COMBO,
            {
                type: VisualizationTypes.COMBO,
                xAxes: [{}, { opposite: true }],
                yAxes: [{}, { opposite: true }],
                secondary_yAxisProps: { name: { position: "high" } },
            },
        ],
        [
            VisualizationTypes.COMBO2,
            {
                type: VisualizationTypes.COMBO2,
                xAxes: [{}, { opposite: true }],
                yAxes: [{}, { opposite: true }],
                secondary_yAxisProps: { name: { position: "high" } },
            },
        ],
        [
            VisualizationTypes.COLUMN,
            {
                type: VisualizationTypes.COLUMN,
                xAxes: [{}, { opposite: true }],
                yAxes: [{}, { opposite: true }],
                secondary_yAxisProps: { name: { position: "high" } },
            },
        ],
        [
            VisualizationTypes.LINE,
            {
                type: VisualizationTypes.LINE,
                xAxes: [{}, { opposite: true }],
                yAxes: [{}, { opposite: true }],
                secondary_yAxisProps: { name: { position: "high" } },
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
            xAxes: [{}, { opposite: true }],
            yAxes: [{}, { opposite: true }],
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
