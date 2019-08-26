// (C) 2019 GoodData Corporation
import { setMeasuresToSecondaryAxis } from "../dualAxis";
import { IChartConfig } from "../..";
import { comboWithThreeMeasuresAndViewByAttributeMdObject } from "../../../stories/test_data/fixtures";

describe("setMeasuresToSecondaryAxis", () => {
    const dualAxisConfig = { secondary_yaxis: { rotation: "90" } };
    const expectedDualAxisConfig = {
        mdObject: comboWithThreeMeasuresAndViewByAttributeMdObject,
        secondary_yaxis: {
            ...dualAxisConfig.secondary_yaxis,
            measures: ["expectedMetric"],
        },
    };

    const TEST_CASES = [
        ["NOT", false, { mdObject: expectedDualAxisConfig.mdObject }],
        ["", true, expectedDualAxisConfig],
        ["", undefined, expectedDualAxisConfig],
    ];

    it.each(TEST_CASES)(
        "should %s add measures to secondary axis when dualAxis=%s",
        (_desc, value, expected) => {
            const config: IChartConfig = {
                type: "combo2",
                mdObject: comboWithThreeMeasuresAndViewByAttributeMdObject,
                dualAxis: value,
                ...dualAxisConfig,
            };
            expect(setMeasuresToSecondaryAxis(config)).toEqual({
                type: "combo2",
                dualAxis: value,
                ...expected,
            });
        },
    );
});
