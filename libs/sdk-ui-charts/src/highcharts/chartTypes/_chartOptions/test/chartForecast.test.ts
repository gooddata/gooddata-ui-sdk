// (C) 2022-2024 GoodData Corporation
import { describe, it, expect } from "vitest";
import { assignForecastAxes, updateForecastWithSettings } from "../chartForecast.js";
import { ISeriesItem } from "../../../typings/unsafe.js";

describe("assignForecastAxes", () => {
    const baseSeries: ISeriesItem = {
        data: [
            { y: 2, format: "0.00", name: "A" },
            { y: 3, format: "0.00", name: "A" },
            { y: 4, format: "0.00", name: "A" },
            { y: 5, format: "0.00", name: "A" },
            { y: 6, format: "0.00", name: "A" },
        ],
        legendIndex: 0,
        color: "rgb(0, 0, 0)",
        name: "A",
    };

    const forecastValues = [
        [
            {
                low: 6.5,
                high: 7.5,
                prediction: 7,
                loading: false,
            },
            {
                low: 7.5,
                high: 8.5,
                prediction: 8,
                loading: false,
            },
            {
                low: 8.5,
                high: 9.5,
                prediction: 9,
                loading: false,
            },
        ],
    ];

    it("should assign if there is line chart with one series and forecast data", () => {
        const data = assignForecastAxes("line", [baseSeries], forecastValues);

        expect(data).toEqual([
            {
                ...baseSeries,
                data: [...baseSeries.data, null, null, null],
            },
            {
                color: "rgb(204,204,204)",
                data: [
                    null,
                    null,
                    null,
                    null,
                    {
                        format: "0.00",
                        high: 6,
                        low: 6,
                        name: "A",
                    },
                    {
                        format: "0.00",
                        high: 7.5,
                        loading: false,
                        low: 6.5,
                        name: "A",
                    },
                    {
                        format: "0.00",
                        high: 8.5,
                        loading: false,
                        low: 7.5,
                        name: "A",
                    },
                    {
                        format: "0.00",
                        high: 9.5,
                        loading: false,
                        low: 8.5,
                        name: "A",
                    },
                ],
                legendIndex: 0,
                lineColor: "rgb(128,128,128)",
                lineWidth: 2,
                marker: {
                    enabled: false,
                },
                name: "A",
                showInLegend: false,
                type: "arearange",
            },
            {
                color: "rgb(0, 0, 0)",
                dashStyle: "dash",
                data: [
                    null,
                    null,
                    null,
                    null,
                    {
                        format: "0.00",
                        name: "A",
                        y: 6,
                    },
                    {
                        format: "0.00",
                        loading: false,
                        name: "A",
                        y: 7,
                    },
                    {
                        format: "0.00",
                        loading: false,
                        name: "A",
                        y: 8,
                    },
                    {
                        format: "0.00",
                        loading: false,
                        name: "A",
                        y: 9,
                    },
                ],
                legendIndex: 0,
                name: "A",
                showInLegend: false,
            },
        ]);
    });

    it("should not assign if there are more series", () => {
        const data = assignForecastAxes("line", [baseSeries, baseSeries], forecastValues);

        expect(data).toEqual([baseSeries, baseSeries]);
    });

    it("should not assign if invalid type", () => {
        const data = assignForecastAxes("area", [baseSeries], forecastValues);

        expect(data).toEqual([baseSeries]);
    });

    it("should not assign if no data", () => {
        const data = assignForecastAxes("line", [{ ...baseSeries, data: [] }], forecastValues);

        expect(data).toEqual([{ ...baseSeries, data: [] }]);
    });

    it("should not assign if no forecast data", () => {
        const data = assignForecastAxes("line", [baseSeries], []);

        expect(data).toEqual([baseSeries]);
    });
});

describe("updateForecastWithSettings", () => {
    it("disabled forecast by state", () => {
        const data = updateForecastWithSettings({}, {}, { enabled: false });

        expect(data).toEqual(undefined);
    });

    it("disabled forecast by config", () => {
        const data = updateForecastWithSettings({}, {}, { enabled: true });

        expect(data).toEqual(undefined);
    });

    it("disabled forecast by FF", () => {
        const data = updateForecastWithSettings(
            { forecast: { enabled: true } } as any,
            {},
            { enabled: true },
        );

        expect(data).toEqual(undefined);
    });

    it("enabled and empty", () => {
        const data = updateForecastWithSettings(
            { forecast: { enabled: true } } as any,
            { enableSmartFunctions: true },
            { enabled: true },
        );

        expect(data).toEqual({
            confidenceLevel: 0.95,
            forecastPeriod: 3,
            seasonal: false,
        });
    });

    it("enabled and filled", () => {
        const data = updateForecastWithSettings(
            { forecast: { enabled: true, period: 5, confidence: 0.75, seasonal: true } },
            { enableSmartFunctions: true },
            { enabled: true },
        );

        expect(data).toEqual({
            confidenceLevel: 0.75,
            forecastPeriod: 5,
            seasonal: true,
        });
    });
});
