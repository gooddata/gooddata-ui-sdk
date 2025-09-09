// (C) 2019-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";

import { recordedDataFacade } from "../../../../../__mocks__/recordings.js";
import { IChartConfig } from "../../../../interfaces/index.js";
import { setMeasuresToSecondaryAxis } from "../dualAxis.js";

describe("setMeasuresToSecondaryAxis", () => {
    const ComboChart = recordedDataFacade(
        ReferenceRecordings.Scenarios.ComboChart
            .OnePrimaryAndSecondaryMeasureWithViewBySortedByAttr as unknown as ScenarioRecording,
    );
    const dualAxisConfig = { secondary_yaxis: { rotation: "90" } };

    const TEST_CASES: [string, boolean | undefined][] = [
        ["", true],
        ["", undefined],
    ];

    it.each<[string, boolean | undefined]>(TEST_CASES)(
        "should %s add measures to secondary axis when dualAxis=%s",
        (_desc: string, value: boolean | undefined) => {
            const config: IChartConfig = {
                type: "combo2",
                dualAxis: value,
                ...dualAxisConfig,
            };
            expect(setMeasuresToSecondaryAxis(config, ComboChart)).toMatchSnapshot();
        },
    );
});
