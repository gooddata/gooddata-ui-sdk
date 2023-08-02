// (C) 2023 GoodData Corporation
import { getChartOrientationConfiguration } from "../getChartOrientationConfiguration.js";
import { describe, it, expect } from "vitest";

describe("getChartOrientationConfiguration", () => {
    it("should return empty object when the chart type is not waterfall", () => {
        const customConfig = getChartOrientationConfiguration(
            {
                type: "column",
            },
            {},
        );

        expect(customConfig).toEqual({});
    });

    it("should return empty object when the chart type is waterfall and the orientation is horizontal", () => {
        const customConfig = getChartOrientationConfiguration(
            {
                type: "waterfall",
            },
            {},
            { orientation: { position: "horizontal" } },
        );

        expect(customConfig).toEqual({});
    });

    it("should return custom configuration when the chart type is waterfall and the orientation is vertical", () => {
        const customConfig = getChartOrientationConfiguration(
            {
                type: "waterfall",
            },
            { plotOptions: { waterfall: {} } },
            { orientation: { position: "vertical" } },
        );

        expect(customConfig.chart).toEqual({ inverted: true });
        expect(customConfig.plotOptions.waterfall).toEqual({
            dataLabels: { crop: false, overflow: "allow", inside: false, verticalAlign: "middle", y: 0 },
        });
        expect(customConfig.xAxis).toBeUndefined();
    });

    it("should ellipsis the label on xAxis", () => {
        const customConfig = getChartOrientationConfiguration(
            {
                type: "waterfall",
            },
            {
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
            { orientation: { position: "vertical" } },
        );

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
