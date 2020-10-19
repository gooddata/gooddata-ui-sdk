// (C) 2019-2020 GoodData Corporation
import { getChartAlignmentConfiguration } from "../getChartAlignmentConfiguration";
import { TOP } from "../../../_to_refactor/constants/alignments";
import { IChartConfig } from "../../../../interfaces";

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
