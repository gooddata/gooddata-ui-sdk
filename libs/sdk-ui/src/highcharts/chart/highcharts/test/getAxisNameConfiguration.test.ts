// (C) 2019 GoodData Corporation
import { IChartOptions } from "../../../Config";
import { getAxisNameConfiguration } from "../getAxisNameConfiguration";

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
});
