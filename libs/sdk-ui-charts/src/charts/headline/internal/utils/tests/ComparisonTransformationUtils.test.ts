// (C) 2023-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";
import { ExplicitDrill, createIntlMock } from "@gooddata/sdk-ui";

import { recordedDataFacade } from "../../../../../../__mocks__/recordings.js";
import { IComparison } from "../../../../../interfaces/index.js";
import { TEST_COMPARISON_TRANSFORMATIONS, TEST_DEFAULT_COMPARISON } from "../../tests/TestData.fixtures.js";
import { getComparisonBaseHeadlineData } from "../ComparisonTransformationUtils.js";

describe("ComparisonTransformationUtils", () => {
    describe("getComparisonBaseHeadlineData", () => {
        const intl = createIntlMock();
        it.each<[string, ScenarioRecording, IComparison, ExplicitDrill[]]>(TEST_COMPARISON_TRANSFORMATIONS)(
            "should transform '%s' correctly",
            (
                _test: string,
                recorded: ScenarioRecording,
                comparison: IComparison,
                drillableItems: ExplicitDrill[],
            ) => {
                const dataFacade = recordedDataFacade(recorded);
                const data = getComparisonBaseHeadlineData(
                    dataFacade.dataView,
                    drillableItems || [],
                    comparison || TEST_DEFAULT_COMPARISON,
                    intl,
                );
                expect(data).toMatchSnapshot();
            },
        );
    });
});
