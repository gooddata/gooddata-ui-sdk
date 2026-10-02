// (C) 2023-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { makeCtx } from "./configurator.test.utils.js";
import { getChartOrientationConfiguration } from "./getChartOrientationConfiguration.js";

describe("getChartOrientationConfiguration", () => {
    it("should return empty object when the chart type is not waterfall", () => {
        const ctx = makeCtx({
            chartOptions: {
                type: "column",
            },
        });

        const customConfig = getChartOrientationConfiguration(ctx);

        expect(customConfig).toEqual({});
    });

    it("should return empty object when the chart type is waterfall and the orientation is horizontal", () => {
        const ctx = makeCtx({
            chartOptions: {
                type: "waterfall",
            },
            chartConfig: { orientation: { position: "horizontal" } },
        });

        const customConfig = getChartOrientationConfiguration(ctx);

        expect(customConfig).toEqual({});
    });

    it("should return custom configuration when the chart type is waterfall and the orientation is vertical", () => {
        const ctx = makeCtx({
            chartOptions: {
                type: "waterfall",
            },
            highchartsOptions: { plotOptions: { waterfall: {} } },
            chartConfig: { orientation: { position: "vertical" } },
        });

        const customConfig = getChartOrientationConfiguration(ctx);

        expect(customConfig.chart).toEqual({ inverted: true });
        expect(customConfig.plotOptions!.waterfall).toEqual({
            dataLabels: { crop: false, overflow: "allow", inside: false, verticalAlign: "middle", y: 0 },
        });
        expect(customConfig.xAxis).toBeUndefined();
    });

    it("should ellipsis the label on xAxis", () => {
        const ctx = makeCtx({
            chartOptions: {
                type: "waterfall",
            },
            highchartsOptions: {
                plotOptions: { waterfall: {} },
                xAxis: [
                    {
                        categories: [
                            "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium",
                            "totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo",
                        ],
                    },
                ],
            },
            chartConfig: { orientation: { position: "vertical" } },
        });

        const customConfig = getChartOrientationConfiguration(ctx);

        expect(customConfig.chart).toEqual({ inverted: true });
        expect(customConfig.xAxis).toEqual([
            {
                labels: {
                    useHTML: true,
                    style: {
                        width: 200,
                        textOverflow: "ellipsis",
                    },
                },
            },
        ]);
    });
});
