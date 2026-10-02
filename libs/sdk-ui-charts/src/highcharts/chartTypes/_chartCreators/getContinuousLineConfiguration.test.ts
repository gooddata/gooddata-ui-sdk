// (C) 2023-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IChartOptions } from "../../typings/unsafe.js";

import { makeCtx } from "./configurator.test.utils.js";
import { getContinuousLineConfiguration } from "./getContinuousLineConfiguration.js";

describe("getContinuousLineConfiguration:", () => {
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
        const ctx = makeCtx({
            chartOptions,
            highchartsOptions: hightChartOptions,
            chartConfig: chartConfigure,
        });

        const config = getContinuousLineConfiguration(ctx);

        expect(config).toEqual({});
    });

    it("should return the empty object for the stacking chart", () => {
        const ctx = makeCtx({
            chartOptions,
            highchartsOptions: hightChartOptions,
            chartConfig: {
                continuousLine: { enabled: true },
                stackMeasures: true,
            },
        });

        const config = getContinuousLineConfiguration(ctx);

        expect(config).toEqual({});
    });

    it("should return the correct object when the continuous line is enabled", () => {
        const ctx = makeCtx({
            chartOptions,
            highchartsOptions: hightChartOptions,
            chartConfig: {
                continuousLine: { enabled: true },
            },
        });

        const config = getContinuousLineConfiguration(ctx);

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
        const ctx = makeCtx({
            chartOptions: { type: "combo" },
            highchartsOptions: {
                series: [
                    {
                        ...seriesItem,
                        type: "area",
                        stack: 0,
                        stacking: "normal",
                    },
                ],
            },
            chartConfig: {
                continuousLine: { enabled: true },
            },
        });

        const config = getContinuousLineConfiguration(ctx);

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
        const ctx = makeCtx({
            chartOptions: { type: "area" },
            highchartsOptions: {
                series: [
                    {
                        ...seriesItem,
                        stack: 0,
                        stacking: "normal",
                    },
                ],
            },
            chartConfig: {
                continuousLine: { enabled: true },
            },
        });

        const config = getContinuousLineConfiguration(ctx);

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
