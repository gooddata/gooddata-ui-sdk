// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ChartType } from "@gooddata/sdk-ui";

import { type LineShape } from "../../../interfaces/chartConfig.js";
import { type HighchartsOptions } from "../../lib/index.js";

import { makeCtx } from "./configurator.test.utils.js";
import { getLineShapeConfiguration } from "./getLineShapeConfiguration.js";

describe("getLineShapeConfiguration", () => {
    it("should correctly map `linear` line shape for line chart", () => {
        const ctx = makeCtx({ chartOptions: { type: "line" }, chartConfig: { lineShape: "linear" } });
        const expected: HighchartsOptions = {}; // No change expected, it should already be a `chart.type = "line"`.

        const actual = getLineShapeConfiguration(ctx);

        expect(actual).toEqual(expected);
    });

    it("should not remap forecasting area range in line chart when line shape is `linear`", () => {
        const ctx = makeCtx({
            chartOptions: { type: "line" },
            chartConfig: { lineShape: "linear" },
            highchartsOptions: {
                series: [{ type: "line" }, { type: "arearange" }, { type: "line" }],
            },
        });
        const expected: HighchartsOptions = {};

        const actual = getLineShapeConfiguration(ctx);

        expect(actual).toEqual(expected);
    });

    it("should correctly map `spline` line shape for line chart", () => {
        const ctx = makeCtx({ chartOptions: { type: "line" }, chartConfig: { lineShape: "spline" } });
        const expected: HighchartsOptions = {
            chart: { type: "spline" },
        };

        const actual = getLineShapeConfiguration(ctx);

        expect(actual).toEqual(expected);
    });

    it("should remap forecasting area range in line chart when line shape is `spline`", () => {
        const ctx = makeCtx({
            chartOptions: { type: "line" },
            chartConfig: { lineShape: "spline" },
            highchartsOptions: {
                series: [{ type: "line" }, { type: "arearange" }, { type: "line" }],
            },
        });
        const expected: HighchartsOptions = {
            series: [{ type: "line" }, { type: "areasplinerange" }, { type: "line" }],
        };

        const actual = getLineShapeConfiguration(ctx);

        expect(actual).toMatchObject(expected);
    });

    it("should correctly map `stepped` line shape for line chart", () => {
        const ctx = makeCtx({ chartOptions: { type: "line" }, chartConfig: { lineShape: "stepped" } });
        const expected: HighchartsOptions = {
            plotOptions: { series: { step: "left" } },
        };

        const actual = getLineShapeConfiguration(ctx);

        expect(actual).toEqual(expected);
    });

    it("should not remap forecasting area range in line chart when line shape is `stepped`", () => {
        const ctx = makeCtx({
            chartOptions: { type: "line" },
            chartConfig: { lineShape: "stepped" },
            highchartsOptions: {
                series: [{ type: "line" }, { type: "arearange" }, { type: "line" }],
            },
        });
        const expected: HighchartsOptions = {
            plotOptions: expect.anything(),
        };

        const actual = getLineShapeConfiguration(ctx);

        expect(actual).toEqual(expected);
    });

    it("should correctly default to `linear` line shape for line chart", () => {
        const ctx = makeCtx({ chartOptions: { type: "line" } });
        const expected: HighchartsOptions = {}; // No change as in the `linear` case above

        const actual = getLineShapeConfiguration(ctx);

        expect(actual).toEqual(expected);
    });

    it("should correctly map `linear` line shape for combo chart", () => {
        const ctx = makeCtx({
            chartOptions: { type: "combo" },
            chartConfig: { lineShape: "linear" },
            highchartsOptions: { series: [{ type: "column" }, { type: "line" }, { type: "area" }] },
        });
        const expected: HighchartsOptions = {}; // No change expected

        const actual = getLineShapeConfiguration(ctx);

        expect(actual).toEqual(expected);
    });

    it("should correctly map `spline` line shape for combo chart", () => {
        const ctx = makeCtx({
            chartOptions: { type: "combo" },
            chartConfig: { lineShape: "spline" },
            highchartsOptions: { series: [{ type: "column" }, { type: "line" }, { type: "area" }] },
        });
        const expected: HighchartsOptions = {
            series: [{ type: "column" }, { type: "spline" }, { type: "areaspline" }],
        };

        const actual = getLineShapeConfiguration(ctx);

        expect(actual).toEqual(expected);
    });

    it("should correctly map `stepped` line shape for combo chart", () => {
        const ctx = makeCtx({ chartOptions: { type: "combo" }, chartConfig: { lineShape: "stepped" } });
        const expected: HighchartsOptions = {
            plotOptions: { series: { step: "left" } },
        };

        const actual = getLineShapeConfiguration(ctx);

        expect(actual).toEqual(expected);
    });

    it("should work with possible `combo2` chart type value for combo chart", () => {
        const ctx = makeCtx({
            /**
             * Note that the chart type value of `combo2` as an input to `getLineShapeConfiguration()` doesn't seem to ever
             * occur in the current code (at the time of this writing). For example, both `PluggableComboChart` and
             * `PluggableComboChartDeprecated` set the type to `VisualizationTypes.COMBO`, and also `<CoreComboChart />`
             * (SDK path) sets `type="combo"` on the `<BaseChart />`.
             *
             * However, given that it is possible to pass a `combo2` value _in the future_ since the current types allow it,
             * this test was created to also ensure proper handling of the `combo2` value.
             */
            chartOptions: { type: "combo2" },
            chartConfig: { lineShape: "spline" },
            highchartsOptions: { series: [{ type: "line" }] },
        });
        const expected: HighchartsOptions = {
            series: [{ type: "spline" }],
        };

        const actual = getLineShapeConfiguration(ctx);

        expect(actual).toEqual(expected);
    });

    it("should correctly default to `linear` line shape for combo chart", () => {
        const ctx = makeCtx({ chartOptions: { type: "combo" } });
        const expected: HighchartsOptions = {}; // No change as in the `linear` case above

        const actual = getLineShapeConfiguration(ctx);

        expect(actual).toEqual(expected);
    });

    it("should correctly map `linear` line shape for area chart", () => {
        const ctx = makeCtx({ chartOptions: { type: "area" }, chartConfig: { lineShape: "linear" } });
        const expected: HighchartsOptions = {}; // No change expected

        const actual = getLineShapeConfiguration(ctx);

        expect(actual).toEqual(expected);
    });

    it("should correctly map `spline` line shape for area chart", () => {
        const ctx = makeCtx({ chartOptions: { type: "area" }, chartConfig: { lineShape: "spline" } });
        const expected: HighchartsOptions = {
            chart: { type: "areaspline" },
        };

        const actual = getLineShapeConfiguration(ctx);

        expect(actual).toEqual(expected);
    });

    it("should correctly map `stepped` line shape for area chart", () => {
        const ctx = makeCtx({ chartOptions: { type: "area" }, chartConfig: { lineShape: "stepped" } });
        const expected: HighchartsOptions = {
            plotOptions: { series: { step: "left" } },
        };

        const actual = getLineShapeConfiguration(ctx);

        expect(actual).toEqual(expected);
    });

    it("should correctly default to `linear` line shape for area chart", () => {
        const ctx = makeCtx({ chartOptions: { type: "area" } });
        const expected: HighchartsOptions = {}; // No change as in the `linear` case above

        const actual = getLineShapeConfiguration(ctx);

        expect(actual).toEqual(expected);
    });

    it.each(["spline", "stepped"] satisfies LineShape[])(
        "should not do anything for unsupported chart types for `%s` line shape",
        (lineShape) => {
            /**
             * This is only a smoke test and does not cover every unsupported chart type. The reason is that there
             * is no chart types enum or constant in the project that list all chart types. There is a VisualizationTypes
             * constant, but it includes unrelated types such as `headline`, which do not satisfy ChartType.
             */
            (["bar", "pie", "heatmap"] satisfies ChartType[]).forEach((type) => {
                const ctx = makeCtx({ chartOptions: { type }, chartConfig: { lineShape } });
                const expected: HighchartsOptions = {};

                const actual = getLineShapeConfiguration(ctx);

                expect
                    // Report all problems and don't abort the test on first expect with expect.soft()
                    .soft(actual, `Expected not to do anything for unsupported chart type ${type}`)
                    .toEqual(expected);
            });
        },
    );
});
