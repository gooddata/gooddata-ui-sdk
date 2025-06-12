// (C) 2023 GoodData Corporation
import { describe, expect, it } from "vitest";

import { DataViewFacade, ExplicitDrill, HeadlineElementType } from "@gooddata/sdk-ui";
import { ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";

import { recordedDataFacade } from "../../../../../../__mocks__/recordings.js";
import { TEST_MULTI_MEASURE_TRANSFORMATION } from "../../tests/TestData.fixtures.js";
import { createBaseHeadlineItem, getBaseHeadlineData } from "../BaseHeadlineTransformationUtils.js";
import { getExecutionData } from "../HeadlineTransformationUtils.js";

describe("BaseHeadlineTransformationUtils", () => {
    describe("getBaseHeadlineData", () => {
        it.each(TEST_MULTI_MEASURE_TRANSFORMATION)(
            "should transform '%s' correctly",
            (_test: string, recorded: ScenarioRecording, drillableItems: ExplicitDrill[] = []) => {
                const dataFacade = recordedDataFacade(recorded);
                const data = getBaseHeadlineData(dataFacade.dataView, drillableItems);
                expect(data).toMatchSnapshot();
            },
        );
    });

    describe("createBaseHeadlineItem", () => {
        const dataFacade = recordedDataFacade(
            ReferenceRecordings.Scenarios.Headline.MultiMeasuresWithThreeMeasures,
        );
        const [firstExecutionData] = getExecutionData(DataViewFacade.for(dataFacade.dataView));

        it("Should return base headline item correctly", () => {
            expect(createBaseHeadlineItem(firstExecutionData, false, "primaryValue")).toMatchSnapshot();
        });

        it.each([true, false])("Should return base headline item with drillable is %s", (expected) => {
            const baseHeadlineItem = createBaseHeadlineItem(firstExecutionData, expected, "primaryValue");
            expect(baseHeadlineItem.data.isDrillable).toBe(expected);
        });

        it.each(["primaryValue", "secondaryValue"])(
            "Should return base headline item with elementType is %s",
            (elementType: HeadlineElementType) => {
                const baseHeadlineItem = createBaseHeadlineItem(firstExecutionData, false, elementType);
                expect(baseHeadlineItem.elementType).toBe(elementType);
            },
        );
    });
});
