// (C) 2021-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { IDashboardLayoutSize } from "@gooddata/sdk-model";

import { resizeInsightWidget } from "../layoutUtils.js";

describe("layout utils", () => {
    describe("resizeInsightWidget", () => {
        function size(gridWidth: number, gridHeight?: number, heightAsRatio?: number): IDashboardLayoutSize {
            return { gridWidth, gridHeight, heightAsRatio };
        }

        function sizeInfo(
            wmn: number,
            wmx: number,
            hmn: number,
            hmx: number,
            wd: number = wmn,
            hd: number = hmn,
        ) {
            return {
                width: { min: wmn, max: wmx, default: wd },
                height: { min: hmn, max: hmx, default: hd },
            };
        }

        it("match into size info, do nothing", () => {
            const results = resizeInsightWidget(size(2, 2), sizeInfo(2, 2, 2, 2));
            expect(results).toEqual({
                gridHeight: 2,
                gridWidth: 2,
            });
        });

        it("is smaller than min width and height", () => {
            const results = resizeInsightWidget(size(2, 2), sizeInfo(5, 20, 5, 20));
            expect(results).toEqual({
                gridHeight: 5,
                gridWidth: 5,
            });
        });

        it("is bigger than max width and height", () => {
            const results = resizeInsightWidget(size(25, 25), sizeInfo(5, 20, 5, 20));
            expect(results).toEqual({
                gridHeight: 20,
                gridWidth: 20,
            });
        });

        it("ratio: match into size info, do nothing", () => {
            const results = resizeInsightWidget(size(5, undefined, 100), sizeInfo(5, 20, 5, 20));
            expect(results).toEqual({
                gridWidth: 5,
                heightAsRatio: 100,
            });
        });

        it("ratio: is smaller than min width and height", () => {
            const results = resizeInsightWidget(size(2, undefined, 100), sizeInfo(5, 20, 5, 20));
            expect(results).toEqual({
                gridWidth: 5,
                heightAsRatio: 100,
            });
        });

        it("ratio: is bigger than max width and height", () => {
            const results = resizeInsightWidget(size(25, undefined, 100), sizeInfo(5, 20, 5, 20));
            expect(results).toEqual({
                gridWidth: 20,
                heightAsRatio: 100,
            });
        });

        it("invalid ratio: match into size info, do nothing", () => {
            const results = resizeInsightWidget(size(5, 5, 100), sizeInfo(5, 20, 5, 20));
            expect(results).toEqual({
                gridWidth: 5,
                gridHeight: 5,
                heightAsRatio: 100,
            });
        });
    });
});
