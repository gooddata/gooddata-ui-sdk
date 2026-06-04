// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { VisualizationTypes } from "@gooddata/sdk-ui";

import { type IChartOptions } from "../../../typings/unsafe.js";
import { getIsFilteringRecommended, validateData } from "../chartLimits.js";

function makeChartOptions({
    type,
    seriesCount,
    stacking,
    dataPointsPerSeries = 1,
}: {
    type: string;
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

        it("does NOT affect LINE chart with 1200 series", () => {
            const options = makeChartOptions({
                type: VisualizationTypes.LINE,
                seriesCount: 1200,
                stacking: "normal", // would not normally apply to line, but guards against future regression
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
