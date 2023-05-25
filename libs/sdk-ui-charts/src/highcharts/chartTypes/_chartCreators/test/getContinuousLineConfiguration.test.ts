// (C) 2023 GoodData Corporation

import { IChartOptions } from "../../../typings/unsafe.js";
import { getContinuousLineConfiguration } from "../getContinuousLineConfiguration.js";
import { describe, it, expect } from "vitest";

describe("getContinuousLineConfiguration: ", () => {
    const chartOptions: Partial<IChartOptions> = { stacking: "normal", type: "area" };
    const seriesItem: any = {
        color: "rgb(191,64,66)",
        isDrillable: false,
        legendIndex: 0,
        name: "Sum of Value",
        data: [
            { y: 10 },
            { y: 15 },
            { y: 20 },
            { y: 10 },
            { y: null },
            { y: 17 },
            { y: null },
            { y: null },
            { y: 5 },
        ],
        stacking: null,
        stack: null,
    };
    const hightChartOptions: any = {
        series: [seriesItem],
    };
    const chartConfigure: any = { continuousLine: { enable: false } };

    it("should return the empty object when the continuous line is disabled", () => {
        const config = getContinuousLineConfiguration(chartOptions, hightChartOptions, chartConfigure);

        expect(config).toEqual({});
    });

    it("should return the empty object for the stacking chart", () => {
        const config = getContinuousLineConfiguration(chartOptions, hightChartOptions, {
            continuousLine: { enabled: true },
            stackMeasures: true,
        });

        expect(config).toEqual({});
    });

    it("should return the correct object when the continuous line is enabled", () => {
        const config = getContinuousLineConfiguration(chartOptions, hightChartOptions, {
            continuousLine: { enabled: true },
        } as any);

        expect(config).toEqual({
            plotOptions: {
                series: {
                    connectNulls: true,
                },
            },
            series: hightChartOptions.series,
        });
    });

    it("should remove the stack configuration for the combo chart", () => {
        const config = getContinuousLineConfiguration(
            { type: "combo" },
            {
                series: [
                    {
                        ...seriesItem,
                        type: "area",
                        stack: 0,
                        stacking: "normal",
                    },
                ],
            },
            {
                continuousLine: { enabled: true },
            } as any,
        );

        expect(config).toEqual({
            plotOptions: {
                series: {
                    connectNulls: true,
                },
            },
            series: [
                {
                    ...seriesItem,
                    type: "area",
                    stack: null,
                    stacking: null,
                },
            ],
        });
    });

    it("should remove the stack configuration for the area chart", () => {
        const config = getContinuousLineConfiguration(
            { type: "area" },
            {
                series: [
                    {
                        ...seriesItem,
                        stack: 0,
                        stacking: "normal",
                    },
                ],
            },
            {
                continuousLine: { enabled: true },
            } as any,
        );

        expect(config).toEqual({
            plotOptions: {
                series: {
                    connectNulls: true,
                },
            },
            series: [
                {
                    ...seriesItem,
                    stack: null,
                    stacking: null,
                },
            ],
        });
    });
});
