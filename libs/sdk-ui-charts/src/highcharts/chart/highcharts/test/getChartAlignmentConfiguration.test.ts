// (C) 2019 GoodData Corporation
import { getChartAlignmentConfiguration } from "../getChartAlignmentConfiguration";
import { TOP } from "../../../constants/alignments";
import { IChartConfig } from "../../../Config";

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
