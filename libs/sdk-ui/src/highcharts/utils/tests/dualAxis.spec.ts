// (C) 2019 GoodData Corporation
import { comboChartWith3MetricsAndViewByAttribute } from "../../../../__mocks__/fixtures";
import { setMeasuresToSecondaryAxis } from "../dualAxis";
import { IChartConfig } from "../../Config";

describe("setMeasuresToSecondaryAxis", () => {
    const dualAxisConfig = { secondary_yaxis: { rotation: "90" } };
    const expectedDualAxisConfig = {
        secondary_yaxis: {
            ...dualAxisConfig.secondary_yaxis,
            measures: ["expectedMetric"],
        },
    };

    const TEST_CASES = [["", true, expectedDualAxisConfig], ["", undefined, expectedDualAxisConfig]];

    it.each(TEST_CASES)(
        "should %s add measures to secondary axis when dualAxis=%s",
        (_desc: string, value: boolean, expected: any) => {
            const config: IChartConfig = {
                type: "combo2",
                dualAxis: value,
                ...dualAxisConfig,
            };
            expect(setMeasuresToSecondaryAxis(config, comboChartWith3MetricsAndViewByAttribute)).toEqual({
                type: "combo2",
                dualAxis: value,
                ...expected,
            });
        },
    );
});
