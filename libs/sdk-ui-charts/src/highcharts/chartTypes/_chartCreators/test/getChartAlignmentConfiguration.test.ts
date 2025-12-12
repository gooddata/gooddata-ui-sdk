// (C) 2019-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { type IChartConfig } from "../../../../interfaces/index.js";
import { TOP } from "../../../constants/alignments.js";
import { getChartAlignmentConfiguration } from "../getChartAlignmentConfiguration.js";

describe("getChartAlignmentConfiguration", () => {
    it("should return chart alignment", () => {
        const chartConfig: Partial<IChartConfig> = getChartAlignmentConfiguration(null, null, {
            chart: {
                verticalAlign: TOP,
            },
        });
        expect(chartConfig).toEqual({
            chart: {
                verticalAlign: "top",
            },
        });
    });

    it("should return empty chart alignment", () => {
        const chartConfig: Partial<IChartConfig> = getChartAlignmentConfiguration(null, null, {});
        expect(chartConfig).toEqual({
            chart: undefined,
        });
    });
});
