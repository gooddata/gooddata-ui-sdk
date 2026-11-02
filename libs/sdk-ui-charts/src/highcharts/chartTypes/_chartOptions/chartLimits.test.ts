// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type ChartType, VisualizationTypes } from "@gooddata/sdk-ui";

import { type IChartOptions } from "../../typings/unsafe.js";

import { getDataTooLargeErrorMessage, getIsFilteringRecommended, validateData } from "./chartLimits.js";

function makeChartOptions({
    type,
    seriesCount,
    stacking,
    dataPointsPerSeries = 1,
}: {
    type: ChartType;
    seriesCount: number;
    stacking: "normal" | "percent" | null;
    dataPointsPerSeries?: number;
}): IChartOptions {
    return {
        type,
        stacking,
        data: {
            series: Array.from({ length: seriesCount }, (_, i) => ({
                name: `s${i}`,
                data: Array.from({ length: dataPointsPerSeries }, () => ({ y: 1 })),
            })),
            categories: Array.from({ length: dataPointsPerSeries }, (_, i) => [`c${i}`]),
        },
    };
}

describe("stacked column/bar series limit", () => {
    describe("validateData", () => {
        it("flags stacked COLUMN above STACKED_COLUMN_BAR_SERIES_LIMIT (1000) as too large", () => {
            const options = makeChartOptions({
                type: VisualizationTypes.COLUMN,
                seriesCount: 1200,
                stacking: "normal",
            });
            expect(validateData(undefined, options).dataTooLarge).toBe(true);
        });

        it("flags stacked BAR above STACKED_COLUMN_BAR_SERIES_LIMIT as too large", () => {
            const options = makeChartOptions({
                type: VisualizationTypes.BAR,
                seriesCount: 1200,
                stacking: "percent",
            });
            expect(validateData(undefined, options).dataTooLarge).toBe(true);
        });

        it("does NOT flag stacked COLUMN below the limit", () => {
            const options = makeChartOptions({
                type: VisualizationTypes.COLUMN,
                seriesCount: 200,
                stacking: "normal",
            });
            expect(validateData(undefined, options).dataTooLarge).toBe(false);
        });

        it("does NOT flag non-stacked COLUMN with 1200 series (under generic 10k cap)", () => {
            const options = makeChartOptions({
                type: VisualizationTypes.COLUMN,
                seriesCount: 1200,
                stacking: null,
            });
            expect(validateData(undefined, options).dataTooLarge).toBe(false);
        });

        it("does NOT affect AREA chart with 1200 series", () => {
            const options = makeChartOptions({
                type: VisualizationTypes.AREA,
                seriesCount: 1200,
                stacking: "normal",
            });
            expect(validateData(undefined, options).dataTooLarge).toBe(false);
        });
    });

    describe("getIsFilteringRecommended", () => {
        it("recommends filtering for stacked COLUMN above SOFT_STACKED_COLUMN_BAR_SERIES_LIMIT (50)", () => {
            const options = makeChartOptions({
                type: VisualizationTypes.COLUMN,
                seriesCount: 100,
                stacking: "normal",
            });
            expect(getIsFilteringRecommended(options)).toBe(true);
        });

        it("does NOT recommend filtering for non-stacked COLUMN with 100 series", () => {
            const options = makeChartOptions({
                type: VisualizationTypes.COLUMN,
                seriesCount: 100,
                stacking: null,
            });
            expect(getIsFilteringRecommended(options)).toBe(false);
        });
    });
});

describe("line chart series limit", () => {
    it.each([
        [144, false],
        [1000, false],
        [1001, true],
        [1750, true],
        [2500, true],
        [9161, true],
    ])("validates %i line series as dataTooLarge: %s", (seriesCount, dataTooLarge) => {
        const options = makeChartOptions({
            type: VisualizationTypes.LINE,
            seriesCount,
            stacking: null,
            dataPointsPerSeries: 4,
        });

        expect(validateData(undefined, options).dataTooLarge).toBe(dataTooLarge);
    });

    it("reports the exceeded series limit in the error message", () => {
        const options = makeChartOptions({
            type: VisualizationTypes.LINE,
            seriesCount: 1750,
            stacking: null,
        });

        expect(getDataTooLargeErrorMessage(undefined, options)).toBe("Series limit: 1000 actual: 1750.");
    });

    it("keeps the default category limit for line charts", () => {
        const options = makeChartOptions({
            type: VisualizationTypes.LINE,
            seriesCount: 1,
            stacking: null,
            dataPointsPerSeries: 10001,
        });

        expect(validateData(undefined, options).dataTooLarge).toBe(true);
    });

    it("allows consumer-supplied limits to replace the line defaults", () => {
        const options = makeChartOptions({
            type: VisualizationTypes.LINE,
            seriesCount: 1750,
            stacking: null,
        });
        const limits = { series: 2000, categories: 10000 };

        expect(validateData(limits, options).dataTooLarge).toBe(false);
        expect(getDataTooLargeErrorMessage(limits, options)).toBe("");
        expect(validateData({ series: 100 }, options).dataTooLarge).toBe(true);
    });
});

describe("mekko negligible column width", () => {
    const mekkoOptions = (widths: number[]): IChartOptions => ({
        type: VisualizationTypes.MEKKO,
        stacking: "normal",
        data: {
            series: [{ name: "s0", data: widths.map((z) => ({ y: 1, z })) }],
            categories: widths.map((_, i) => [`c${i}`]),
        },
    });

    it("recommends filtering when a low Width value makes its column invisible", () => {
        expect(getIsFilteringRecommended(mekkoOptions([1000, 500, 1]))).toBe(true);
    });

    it("does NOT recommend filtering when all columns stay wide enough", () => {
        expect(getIsFilteringRecommended(mekkoOptions([1000, 500, 100]))).toBe(false);
    });

    it("does not report the slim column as a validation error", () => {
        expect(validateData(undefined, mekkoOptions([1000, 500, 1]))).toEqual({
            dataTooLarge: false,
            hasNegativeValue: false,
        });
    });
});

describe("column/bar total data points limit", () => {
    describe("validateData", () => {
        it("flags COLUMN over COLUMN_BAR_TOTAL_DATA_POINTS_LIMIT (6000) when neither series nor categories alone hit their cap (EB-767)", () => {
            // 13 series x 2060 categories = 26,780 points: series < 10000, categories < 10000, but product freezes
            const options = makeChartOptions({
                type: VisualizationTypes.COLUMN,
                seriesCount: 13,
                stacking: null,
                dataPointsPerSeries: 2060,
            });
            expect(validateData(undefined, options).dataTooLarge).toBe(true);
        });

        it("flags BAR over the total data points limit", () => {
            const options = makeChartOptions({
                type: VisualizationTypes.BAR,
                seriesCount: 13,
                stacking: null,
                dataPointsPerSeries: 815, // 13 x 815 = 10,595 points
            });
            expect(validateData(undefined, options).dataTooLarge).toBe(true);
        });

        it("does NOT flag COLUMN with total data points under the limit", () => {
            const options = makeChartOptions({
                type: VisualizationTypes.COLUMN,
                seriesCount: 13,
                stacking: null,
                dataPointsPerSeries: 400, // 13 x 400 = 5,200 points
            });
            expect(validateData(undefined, options).dataTooLarge).toBe(false);
        });

        it("does NOT apply the total data points cap to LINE charts", () => {
            const options = makeChartOptions({
                type: VisualizationTypes.LINE,
                seriesCount: 13,
                stacking: null,
                dataPointsPerSeries: 2060,
            });
            expect(validateData(undefined, options).dataTooLarge).toBe(false);
        });

        it("does NOT apply the internal total cap when the consumer supplies its own limits", () => {
            // Same 26,780-point COLUMN the default cap flags, but consumer limits replace the defaults.
            const options = makeChartOptions({
                type: VisualizationTypes.COLUMN,
                seriesCount: 13,
                stacking: null,
                dataPointsPerSeries: 2060,
            });
            const consumerLimits = { series: 100000, categories: 100000 };
            expect(validateData(consumerLimits, options).dataTooLarge).toBe(false);
        });
    });

    describe("getIsFilteringRecommended", () => {
        it("recommends filtering for COLUMN above SOFT_COLUMN_BAR_TOTAL_DATA_POINTS_LIMIT (2000)", () => {
            const options = makeChartOptions({
                type: VisualizationTypes.COLUMN,
                seriesCount: 10,
                stacking: null,
                dataPointsPerSeries: 300, // 10 x 300 = 3,000 points
            });
            expect(getIsFilteringRecommended(options)).toBe(true);
        });

        it("does NOT recommend filtering for COLUMN with total data points under the soft limit", () => {
            const options = makeChartOptions({
                type: VisualizationTypes.COLUMN,
                seriesCount: 10,
                stacking: null,
                dataPointsPerSeries: 100, // 10 x 100 = 1,000 points
            });
            expect(getIsFilteringRecommended(options)).toBe(false);
        });
    });
});
