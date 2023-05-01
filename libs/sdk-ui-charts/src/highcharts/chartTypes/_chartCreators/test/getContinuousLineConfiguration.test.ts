// (C) 2023 GoodData Corporation

import { IChartOptions } from "../../../typings/unsafe";
import { getContinuousLineConfiguration } from "../getContinuousLineConfiguration";

describe("getContinuousLineConfiguration: ", () => {
    const chartOptions: Partial<IChartOptions> = { stacking: "normal", type: "area" };
    const hightChartOptions: any = {
        series: [
            {
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
            },
        ],
    };
    const chartConfigure: any = { continuousLine: { enable: false } };

    it("should return the empty object when the continuous line is disabled", () => {
        const config = getContinuousLineConfiguration(chartOptions, hightChartOptions, chartConfigure);

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
        });
    });
});
