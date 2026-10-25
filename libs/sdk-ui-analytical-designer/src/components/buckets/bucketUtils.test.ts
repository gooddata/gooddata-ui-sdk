// (C) 2023-2026 GoodData Corporation

// @vitest-environment node
import { range } from "lodash-es";
import { describe, expect, it } from "vitest";

import { getVisualizationPickerRowLength } from "./bucketUtils.js";

describe("bucketUtils", () => {
    describe("calculateRowLength", () => {
        it("counts number of visualizations in one row", () => {
            const numbersOfVisualizationClasses = range(16);
            const rowLengths = [4, 4, 4, 4, 4, 5, 4, 4, 4, 5, 5, 4, 4, 5, 5, 5];

            /* rules when deciding between 4 and 5 visualization types on a row:
             * 1) there never must be a single visualization type alone on the last row
             * 2) if both 4 and 5 are acceptable, prefer lower row count (i.e. 4)
             */

            /*
             * _________
             * |X|X| | |     // up to 4 items, a single row of 4
             * ---------
             * ___________
             * |X|X|X|X|X|   // 5 items, a single row of 5
             * -----------
             * _________
             * |X|X|X|X|     // 6-8 items
             * |X|X| | |
             * ---------
             * ___________
             * |X|X|X|X|X|   // 9-10 items
             * |X|X|X|X| |
             * -----------
             * _________
             * |X|X|X|X|     // 11-12 items
             * |X|X|X|X|
             * |X|X|X| |
             * ---------
             * ___________
             * |X|X|X|X|X|   // 13-15 items
             * |X|X|X|X|X|
             * |X|X|X| | |
             * -----------
             */
            expect(numbersOfVisualizationClasses.map(getVisualizationPickerRowLength)).toEqual(rowLengths);
        });
    });
});
