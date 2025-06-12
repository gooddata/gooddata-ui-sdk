// (C) 2019-2020 GoodData Corporation
import { setMeasuresToSecondaryAxis } from "../dualAxis.js";
import { IChartConfig } from "../../../../interfaces/index.js";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedDataFacade } from "../../../../../__mocks__/recordings.js";
import { describe, it, expect } from "vitest";

describe("setMeasuresToSecondaryAxis", () => {
    const ComboChart = recordedDataFacade(
        ReferenceRecordings.Scenarios.ComboChart.OnePrimaryAndSecondaryMeasureWithViewBySortedByAttr,
    );
    const dualAxisConfig = { secondary_yaxis: { rotation: "90" } };

    const TEST_CASES = [
        ["", true],
        ["", undefined],
    ];

    it.each(TEST_CASES)(
        "should %s add measures to secondary axis when dualAxis=%s",
        (_desc: string, value: boolean) => {
            const config: IChartConfig = {
                type: "combo2",
                dualAxis: value,
                ...dualAxisConfig,
            };
            expect(setMeasuresToSecondaryAxis(config, ComboChart)).toMatchSnapshot();
        },
    );
});
