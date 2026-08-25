// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { HeaderPredicates, createIntlMock } from "@gooddata/sdk-ui";

import {
    headlineWithOneMeasure,
    headlineWithOneMeasureWithIdentifier,
    headlineWithTwoMeasures,
    headlineWithTwoMeasuresBothEmpty,
    headlineWithTwoMeasuresBothSame,
    headlineWithTwoMeasuresBothZero,
    headlineWithTwoMeasuresFirstEmpty,
    headlineWithTwoMeasuresFirstZero,
    headlineWithTwoMeasuresSecondEmpty,
    headlineWithTwoMeasuresSecondZero,
    headlineWithTwoMeasuresWithIdentifier,
} from "../../../../../testUtils/fixtures.js";
import { type IHeadlineData } from "../interfaces/Headlines.js";

import {
    type IHeadlineDrillItemContext,
    applyDrillableItems,
    buildDrillEventData,
    getHeadlineData,
} from "./HeadlineTransformationUtils.js";

// Measures of the reference-workspace Headline recordings backing the fixtures above:
// primary is Won, secondary is Amount.
const PRIMARY_MEASURE_ID = "e519fa2a-86c3-4e32-8313-0c03062348j3";
const PRIMARY_MEASURE_LOCAL_ID = "m_e519fa2a_86c3_4e32_8313_0c03062348j3";
const SECONDARY_MEASURE_ID = "87a053b0-3947-49f3-b0c5-de53fd01f050";
const SECONDARY_MEASURE_LOCAL_ID = "m_87a053b0_3947_49f3_b0c5_de53fd01f050";

// Helper to create test data with required format field
const createTestData = (primaryItem: any, secondaryItem?: any, tertiaryItem?: any): IHeadlineData => ({
    primaryItem: { format: null, ...primaryItem },
    ...(secondaryItem && { secondaryItem: { format: null, ...secondaryItem } }),
    ...(tertiaryItem && { tertiaryItem: { format: null, ...tertiaryItem } }),
});

describe("HeadlineTransformationUtils", () => {
    describe("getData", () => {
        it("should set primary item data from the execution", () => {
            const intl = createIntlMock();

            const data = getHeadlineData(headlineWithOneMeasure.dataView, intl);
            expect(data).toMatchSnapshot();
        });

        it("should set primary, secondary and tertiary item data from the execution", () => {
            const intl = createIntlMock();

            const data = getHeadlineData(headlineWithTwoMeasures.dataView, intl);
            expect(data).toMatchSnapshot();
        });

        it("should set null for tertiary value when primary value is null", () => {
            const intl = createIntlMock();

            const data = getHeadlineData(headlineWithTwoMeasuresFirstEmpty.dataView, intl);
            expect(data).toMatchSnapshot();
        });

        it("should set null for tertiary value when secondary value is null", () => {
            const intl = createIntlMock();

            const data = getHeadlineData(headlineWithTwoMeasuresSecondEmpty.dataView, intl);
            expect(data).toMatchSnapshot();
        });

        it("should set null for tertiary value when both primary & secondary values are null", () => {
            const intl = createIntlMock();

            const data = getHeadlineData(headlineWithTwoMeasuresBothEmpty.dataView, intl);
            expect(data).toMatchSnapshot();
        });

        it("should set -100 for tertiary value when primary value is 0", () => {
            const intl = createIntlMock();

            const data = getHeadlineData(headlineWithTwoMeasuresFirstZero.dataView, intl);
            expect(data).toMatchSnapshot();
        });

        it("should set null for tertiary value when secondary value is 0", () => {
            const intl = createIntlMock();

            const data = getHeadlineData(headlineWithTwoMeasuresSecondZero.dataView, intl);
            expect(data).toMatchSnapshot();
        });

        it("should set null for tertiary value when both primary & secondary values are 0", () => {
            const intl = createIntlMock();

            const data = getHeadlineData(headlineWithTwoMeasuresBothZero.dataView, intl);
            expect(data).toMatchSnapshot();
        });

        it("should set 0 for tertiary value when both primary & secondary are the same values except 0", () => {
            const intl = createIntlMock();

            const data = getHeadlineData(headlineWithTwoMeasuresBothSame.dataView, intl);
            expect(data).toMatchSnapshot();
        });
    });

    describe("applyDrillableItems", () => {
        it("should NOT throw any error when drillable items do not match defined headline or execution data", () => {
            const headlineData = {};
            const data = applyDrillableItems(
                headlineData as IHeadlineData,
                [HeaderPredicates.uriMatch("some-uri")],
                headlineWithTwoMeasures.dataView,
            );
            expect(data).toEqual({});
        });

        it("should reset drilling state of every item when drillable items does not match any header item", () => {
            const data = createTestData({
                localIdentifier: "m1",
                title: "Lost",
                value: "120",
                isDrillable: true,
            });
            const updatedData = applyDrillableItems(
                data,
                [HeaderPredicates.uriMatch("some-uri")],
                headlineWithTwoMeasures.dataView,
            );

            expect(updatedData).toMatchSnapshot();
        });

        it("should enable drilling of the primary item identified by the drillable item local identifier", () => {
            const data = applyDrillableItems(
                createTestData({
                    localIdentifier: "m1",
                    title: "Lost",
                    value: "120",
                    isDrillable: false,
                }),
                [HeaderPredicates.localIdentifierMatch(PRIMARY_MEASURE_LOCAL_ID)],
                headlineWithOneMeasure.dataView,
            );

            expect(data).toMatchSnapshot();
        });

        it("should enable drilling of the primary item identified by the drillable item identifier", () => {
            const data = applyDrillableItems(
                createTestData({
                    localIdentifier: "m1",
                    title: "Lost",
                    value: "120",
                    isDrillable: false,
                }),
                [HeaderPredicates.identifierMatch(PRIMARY_MEASURE_ID)],
                headlineWithOneMeasureWithIdentifier.dataView,
            );

            expect(data).toMatchSnapshot();
        });

        it("should enable drilling of the secondary item identified by the drillable item local identifier", () => {
            const headlineData = createTestData(
                {
                    localIdentifier: "m1",
                    title: "Lost",
                    value: "120",
                    isDrillable: false,
                },
                {
                    localIdentifier: "m2",
                    title: "Found",
                    value: "220",
                    isDrillable: false,
                },
            );
            const data = applyDrillableItems(
                headlineData,
                [HeaderPredicates.localIdentifierMatch(SECONDARY_MEASURE_LOCAL_ID)],
                headlineWithTwoMeasures.dataView,
            );

            expect(data).toMatchSnapshot();
        });

        it("should enable drilling of the secondary item identified by the drillable item identifier", () => {
            const headlineData = createTestData(
                {
                    localIdentifier: "m1",
                    title: "Lost",
                    value: "120",
                    isDrillable: false,
                },
                {
                    localIdentifier: "m2",
                    title: "Found",
                    value: "220",
                    isDrillable: false,
                },
            );
            const data = applyDrillableItems(
                headlineData,
                [HeaderPredicates.identifierMatch(SECONDARY_MEASURE_ID)],
                headlineWithTwoMeasuresWithIdentifier.dataView,
            );

            expect(data).toMatchSnapshot();
        });

        it("should enable drilling of the both items (primary, secondary)", () => {
            const data = applyDrillableItems(
                createTestData(
                    {
                        localIdentifier: "m1",
                        title: "Lost",
                        value: "120",
                        isDrillable: false,
                    },
                    {
                        localIdentifier: "m2",
                        title: "Found",
                        value: "220",
                        isDrillable: false,
                    },
                ),
                [
                    HeaderPredicates.identifierMatch(PRIMARY_MEASURE_ID),
                    HeaderPredicates.identifierMatch(SECONDARY_MEASURE_ID),
                ],
                headlineWithTwoMeasures.dataView,
            );

            expect(data).toMatchSnapshot();
        });

        it("should treat provided data object as immutable", () => {
            const data = createTestData({
                localIdentifier: "m1",
                title: "Lost",
                value: "120",
                isDrillable: false,
            });
            const updatedData = applyDrillableItems(
                data,
                [HeaderPredicates.identifierMatch(PRIMARY_MEASURE_ID)],
                headlineWithOneMeasure.dataView,
            );

            expect(updatedData).toMatchSnapshot();
            expect(data.primaryItem.isDrillable).toEqual(false);
        });
    });

    describe("buildDrillEventData", () => {
        it("should build expected drill event data from execution for primary value", () => {
            const itemContext: IHeadlineDrillItemContext = {
                localIdentifier: PRIMARY_MEASURE_LOCAL_ID,
                element: "primaryValue",
                value: "38310753.45",
            };
            const eventData = buildDrillEventData(itemContext, headlineWithOneMeasure.dataView);
            expect(eventData.dataView).toEqual(headlineWithOneMeasure.dataView);
            expect(eventData.drillContext).toMatchSnapshot();
        });

        it("should build drill event data from execution for secondary value", () => {
            const itemContext: IHeadlineDrillItemContext = {
                localIdentifier: SECONDARY_MEASURE_LOCAL_ID,
                element: "secondaryValue",
                value: "116625456.54",
            };
            const eventData = buildDrillEventData(itemContext, headlineWithTwoMeasures.dataView);
            expect(eventData.dataView).toEqual(headlineWithTwoMeasures.dataView);
            expect(eventData.drillContext).toMatchSnapshot();
        });

        it("should throw exception when metric from item context is not found in the execution response.", () => {
            const itemContext: IHeadlineDrillItemContext = {
                localIdentifier: "abc",
                element: "primaryValue",
                value: "42",
            };
            expect(() => buildDrillEventData(itemContext, headlineWithOneMeasure.dataView)).toThrow();
        });
    });
});
