// (C) 2022-2026 GoodData Corporation

// @vitest-environment node
import { describe, expect, it } from "vitest";

import { areaSortAsc1, attributeSortConfig } from "../../tests/chart_sort.test.helpers.js";

import { getAppliedSort, getSortConfig } from "./chart_sort_selector.js";
import { type IChartSortState } from "./chart_sort_state.js";

describe("chart sort selector", () => {
    const state: IChartSortState = { appliedSort: [areaSortAsc1], sortConfig: attributeSortConfig };

    describe("getSortConfig", () => {
        it("should return sort config from sort state", () => {
            const config = getSortConfig.resultFunc(state);
            expect(config).toMatchSnapshot();
        });
    });

    describe("getAppliedSort", () => {
        it("should return applied sort from sort state", () => {
            const config = getAppliedSort.resultFunc(state);
            expect(config).toMatchSnapshot();
        });
    });
});
