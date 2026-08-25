// (C) 2026 GoodData Corporation

// @vitest-environment node

import Highcharts from "highcharts/esm/highcharts.js";
import { beforeAll, describe, expect, it } from "vitest";

import { type UnsafeInternals } from "../../../typings/unsafe.js";

import { groupedCategories } from "./grouped-categories.js";

function buildCategories(categories: unknown[]): Array<{ name: unknown }> {
    const axisProto: UnsafeInternals = (Highcharts as UnsafeInternals).Axis.prototype;
    const fakeAxis: UnsafeInternals = {
        options: { labels: {} },
        isXAxis: true,
        side: 0,
        categories: [],
    };
    axisProto.setupGroups.call(fakeAxis, { categories });
    const typedAxis = fakeAxis as { categories: Array<{ name: unknown }> };
    return typedAxis.categories;
}

describe("groupedCategories", () => {
    beforeAll(() => {
        groupedCategories(Highcharts);
    });

    it("resolves a plain string category to itself", () => {
        const [category] = buildCategories(["Plain"]);
        expect(category.name).toBe("Plain");
    });

    it("resolves an object category's name when it is non-empty", () => {
        const [category] = buildCategories([{ name: "Status", categories: undefined }]);
        expect(category.name).toBe("Status");
    });

    it("resolves an empty-string object category name to an empty string, not the wrapping object", () => {
        const [category] = buildCategories([{ name: "", categories: undefined }]);
        expect(category.name).toBe("");
    });

    it("resolves an undefined object category name to an empty string", () => {
        const [category] = buildCategories([{ name: undefined, categories: undefined }]);
        expect(category.name).toBe("");
    });
});
