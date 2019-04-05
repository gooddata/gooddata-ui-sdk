// (C) 2019 GoodData Corporation
import { setMeasuresToSecondaryAxis } from "../dualAxis";
import { measures } from "../../../__mocks__/fixtures";

describe("setMeasuresToSecondaryAxis", () => {
    const dualAxisConfig = { secondary_yaxis: { rotation: "90" } };
    const expectedDualAxisConfig = {
        secondary_yaxis: {
            ...dualAxisConfig.secondary_yaxis,
            measures: ["m1", "m2"],
        },
    };
    const TEST_CASES = [
        ["NOT", false, {}, {}],
        ["", true, expectedDualAxisConfig],
        ["", undefined, expectedDualAxisConfig],
    ];

    it.each(TEST_CASES)(
        "should %s add measures to secondary axis when dualAxis=%s",
        (_desc, value, expected) => {
            const config = {
                dualAxis: value,
                ...dualAxisConfig,
            };

            expect(setMeasuresToSecondaryAxis(measures, config)).toEqual({
                dualAxis: value,
                ...expected,
            });
        },
    );
});
