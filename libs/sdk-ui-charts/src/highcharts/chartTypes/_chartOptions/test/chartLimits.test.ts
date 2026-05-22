// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { VisualizationTypes } from "@gooddata/sdk-ui";

import { type IChartOptions } from "../../../typings/unsafe.js";
import { getIsFilteringRecommended, validateData } from "../chartLimits.js";

function makeChartOptions({
    type,
    seriesCount,
    stacking,
}: {
    type: string;
    seriesCount: number;
    stacking: "normal" | "percent" | null;
}): IChartOptions {
    return {
        type,
        stacking,
        data: {
            series: Array.from({ length: seriesCount }, (_, i) => ({
                name: `s${i}`,
                data: [{ y: 1 }],
            })),
            categories: [["c"]],
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
