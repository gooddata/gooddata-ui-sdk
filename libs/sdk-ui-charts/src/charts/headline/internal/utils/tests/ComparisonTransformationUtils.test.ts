// (C) 2023 GoodData Corporation
import { describe, expect, it } from "vitest";

import { createIntlMock, ExplicitDrill } from "@gooddata/sdk-ui";
import { ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";

import { recordedDataFacade } from "../../../../../../__mocks__/recordings.js";
import { getComparisonBaseHeadlineData } from "../ComparisonTransformationUtils.js";
import { IComparison } from "../../../../../interfaces/index.js";
import { TEST_COMPARISON_TRANSFORMATIONS, TEST_DEFAULT_COMPARISON } from "../../tests/TestData.fixtures.js";

describe("ComparisonTransformationUtils", () => {
    describe("getComparisonBaseHeadlineData", () => {
        const intl = createIntlMock();
        it.each(TEST_COMPARISON_TRANSFORMATIONS)(
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
