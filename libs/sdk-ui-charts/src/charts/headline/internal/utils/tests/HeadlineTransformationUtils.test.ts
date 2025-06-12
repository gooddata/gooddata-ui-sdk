// (C) 2007-2020 GoodData Corporation
import {
    applyDrillableItems,
    buildDrillEventData,
    getHeadlineData,
    IHeadlineDrillItemContext,
} from "../HeadlineTransformationUtils.js";
import { createIntlMock, HeaderPredicates } from "@gooddata/sdk-ui";
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
} from "../../../../../../__mocks__/fixtures.js";
import { IHeadlineData } from "../../interfaces/Headlines.js";
import { describe, it, expect } from "vitest";

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
            const data = {
                primaryItem: {
                    localIdentifier: "m1",
                    title: "Lost",
                    value: "120",
                    isDrillable: true,
                },
            };
            const updatedData = applyDrillableItems(
                data,
                [HeaderPredicates.uriMatch("some-uri")],
                headlineWithTwoMeasures.dataView,
            );

            expect(updatedData).toMatchSnapshot();
        });

        it("should enable drilling of the primary item identified by the drillable item uri", () => {
            const data = applyDrillableItems(
                {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Lost",
                        value: "120",
                        isDrillable: false,
                    },
                },
                [HeaderPredicates.uriMatch("/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283")],
                headlineWithOneMeasure.dataView,
            );

            expect(data).toMatchSnapshot();
        });

        it("should enable drilling of the primary item identified by the drillable item identifier", () => {
            const data = applyDrillableItems(
                {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Lost",
                        value: "120",
                        isDrillable: false,
                    },
                },
                [HeaderPredicates.identifierMatch("af2Ewj9Re2vK")],
                headlineWithOneMeasureWithIdentifier.dataView,
            );

            expect(data).toMatchSnapshot();
        });

        it("should enable drilling of the secondary item identified by the drillable item uri", () => {
            const headlineData = {
                secondaryItem: {
                    localIdentifier: "m2",
                    title: "Found",
                    value: "220",
                    isDrillable: false,
                },
            };
            const data = applyDrillableItems(
                headlineData as IHeadlineData,
                [HeaderPredicates.uriMatch("/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1284")],
                headlineWithTwoMeasures.dataView,
            );

            expect(data).toMatchSnapshot();
        });

        it("should enable drilling of the secondary item identified by the drillable item identifier", () => {
            const headlineData = {
                secondaryItem: {
                    localIdentifier: "m2",
                    title: "Found",
                    value: "220",
                    isDrillable: false,
                },
            };
            const data = applyDrillableItems(
                headlineData as IHeadlineData,
                [HeaderPredicates.identifierMatch("afSEwRwdbMeQ")],
                headlineWithTwoMeasuresWithIdentifier.dataView,
            );

            expect(data).toMatchSnapshot();
        });

        it("should enable drilling of the both items (primary, secondary)", () => {
            const data = applyDrillableItems(
                {
                    primaryItem: {
                        localIdentifier: "m1",
                        title: "Lost",
                        value: "120",
                        isDrillable: false,
                    },
                    secondaryItem: {
                        localIdentifier: "m2",
                        title: "Found",
                        value: "220",
                        isDrillable: false,
                    },
                },
                [
                    HeaderPredicates.uriMatch("/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283"),
                    HeaderPredicates.uriMatch("/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1284"),
                ],
                headlineWithTwoMeasures.dataView,
            );

            expect(data).toMatchSnapshot();
        });

        it("should treat provided data object as immutable", () => {
            const data = {
                primaryItem: {
                    localIdentifier: "m1",
                    title: "Lost",
                    value: "120",
                    isDrillable: false,
                },
            };
            const updatedData = applyDrillableItems(
                data,
                [HeaderPredicates.uriMatch("/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283")],
                headlineWithOneMeasure.dataView,
            );

            expect(updatedData).toMatchSnapshot();
            expect(data.primaryItem.isDrillable).toEqual(false);
        });
    });

    describe("buildDrillEventData", () => {
        it("should build expected drill event data from execution request made with metric uri", () => {
            const itemContext: IHeadlineDrillItemContext = {
                localIdentifier: "lostMetric",
                element: "primaryValue",
                value: "9011389.956",
            };
            const eventData = buildDrillEventData(itemContext, headlineWithOneMeasure.dataView);
            expect(eventData.dataView).toEqual(headlineWithOneMeasure.dataView);
            expect(eventData.drillContext).toMatchSnapshot();
        });

        it("should build expected drill event data from execution request made with metric identifier", () => {
            const itemContext: IHeadlineDrillItemContext = {
                localIdentifier: "lostMetric",
                element: "primaryValue",
                value: "9011389.956",
            };
            const eventData = buildDrillEventData(itemContext, headlineWithOneMeasureWithIdentifier.dataView);
            expect(eventData.dataView).toEqual(headlineWithOneMeasureWithIdentifier.dataView);
            expect(eventData.drillContext).toMatchSnapshot();
        });

        it("should build drill event data from execution for secondary value", () => {
            const itemContext: IHeadlineDrillItemContext = {
                localIdentifier: "wonMetric",
                element: "secondaryValue",
                value: "42470571.16",
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
