// (C) 2007-2018 GoodData Corporation
import {
    applyDrillableItems,
    buildDrillEventData,
    fireDrillEvent,
    getHeadlineData,
    IHeadlineDrillItemContext,
} from "../HeadlineTransformationUtils";
import { createIntlMock } from "../../../../../base/helpers/intlUtils";
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
} from "../../../../../../__mocks__/fixtures";
import { IHeadlineData } from "../../../Headlines";
import { identifierMatch, uriMatch } from "../../../../../base/factory/HeaderPredicateFactory";
import { IDrillEvent2 } from "../../../../../base/interfaces/DrillEvents";

describe("HeadlineTransformationUtils", () => {
    describe("getData", () => {
        it("should set primary item data from the execution", () => {
            const intl = createIntlMock();

            const data = getHeadlineData(headlineWithOneMeasure.dataView, intl);
            expect(data).toEqual({
                primaryItem: {
                    localIdentifier: "lostMetric",
                    title: "Lost",
                    value: "9011389.956",
                    format: "#,##0.00",
                    isDrillable: false,
                },
            });
        });

        it("should set primary, secondary and tertiary item data from the execution", () => {
            const intl = createIntlMock();

            const data = getHeadlineData(headlineWithTwoMeasures.dataView, intl);
            expect(data).toEqual({
                primaryItem: {
                    localIdentifier: "lostMetric",
                    title: "Lost",
                    value: "9011389.956",
                    format: "#,##0.00",
                    isDrillable: false,
                },
                secondaryItem: {
                    localIdentifier: "wonMetric",
                    title: "Won",
                    value: "42470571.16",
                    format: "#,##0.00",
                    isDrillable: false,
                },
                tertiaryItem: {
                    localIdentifier: "tertiaryIdentifier",
                    value: "-78.78203727929332",
                    format: null,
                    title: "Versus",
                    isDrillable: false,
                },
            });
        });

        it("should set null for tertiary value when primary value is null", () => {
            const intl = createIntlMock();

            const data = getHeadlineData(headlineWithTwoMeasuresFirstEmpty.dataView, intl);
            expect(data).toEqual({
                primaryItem: {
                    localIdentifier: "lostMetric",
                    title: "Lost",
                    value: null,
                    format: "#,##0.00",
                    isDrillable: false,
                },
                secondaryItem: {
                    localIdentifier: "wonMetric",
                    title: "Won",
                    value: "42470571.16",
                    format: "#,##0.00",
                    isDrillable: false,
                },
                tertiaryItem: {
                    localIdentifier: "tertiaryIdentifier",
                    value: null,
                    format: null,
                    title: "Versus",
                    isDrillable: false,
                },
            });
        });

        it("should set null for tertiary value when secondary value is null", () => {
            const intl = createIntlMock();

            const data = getHeadlineData(headlineWithTwoMeasuresSecondEmpty.dataView, intl);
            expect(data).toEqual({
                primaryItem: {
                    localIdentifier: "lostMetric",
                    title: "Lost",
                    value: "9011389.956",
                    format: "#,##0.00",
                    isDrillable: false,
                },
                secondaryItem: {
                    localIdentifier: "wonMetric",
                    title: "Won",
                    value: null,
                    format: "#,##0.00",
                    isDrillable: false,
                },
                tertiaryItem: {
                    localIdentifier: "tertiaryIdentifier",
                    value: null,
                    format: null,
                    title: "Versus",
                    isDrillable: false,
                },
            });
        });

        it("should set null for tertiary value when both primary & secondary values are null", () => {
            const intl = createIntlMock();

            const data = getHeadlineData(headlineWithTwoMeasuresBothEmpty.dataView, intl);
            expect(data).toEqual({
                primaryItem: {
                    localIdentifier: "lostMetric",
                    title: "Lost",
                    value: null,
                    format: "#,##0.00",
                    isDrillable: false,
                },
                secondaryItem: {
                    localIdentifier: "wonMetric",
                    title: "Won",
                    value: null,
                    format: "#,##0.00",
                    isDrillable: false,
                },
                tertiaryItem: {
                    localIdentifier: "tertiaryIdentifier",
                    value: null,
                    format: null,
                    title: "Versus",
                    isDrillable: false,
                },
            });
        });

        it("should set -100 for tertiary value when primary value is 0", () => {
            const intl = createIntlMock();

            const data = getHeadlineData(headlineWithTwoMeasuresFirstZero.dataView, intl);
            expect(data).toEqual({
                primaryItem: {
                    localIdentifier: "lostMetric",
                    title: "Lost",
                    value: "0",
                    format: "#,##0.00",
                    isDrillable: false,
                },
                secondaryItem: {
                    localIdentifier: "wonMetric",
                    title: "Won",
                    value: "42470571.16",
                    format: "#,##0.00",
                    isDrillable: false,
                },
                tertiaryItem: {
                    localIdentifier: "tertiaryIdentifier",
                    value: "-100",
                    format: null,
                    title: "Versus",
                    isDrillable: false,
                },
            });
        });

        it("should set null for tertiary value when secondary value is 0", () => {
            const intl = createIntlMock();

            const data = getHeadlineData(headlineWithTwoMeasuresSecondZero.dataView, intl);
            expect(data).toEqual({
                primaryItem: {
                    localIdentifier: "lostMetric",
                    title: "Lost",
                    value: "9011389.956",
                    format: "#,##0.00",
                    isDrillable: false,
                },
                secondaryItem: {
                    localIdentifier: "wonMetric",
                    title: "Won",
                    value: "0",
                    format: "#,##0.00",
                    isDrillable: false,
                },
                tertiaryItem: {
                    localIdentifier: "tertiaryIdentifier",
                    value: null,
                    format: null,
                    title: "Versus",
                    isDrillable: false,
                },
            });
        });

        it("should set null for tertiary value when both primary & secondary values are 0", () => {
            const intl = createIntlMock();

            const data = getHeadlineData(headlineWithTwoMeasuresBothZero.dataView, intl);
            expect(data).toEqual({
                primaryItem: {
                    localIdentifier: "lostMetric",
                    title: "Lost",
                    value: "0",
                    format: "#,##0.00",
                    isDrillable: false,
                },
                secondaryItem: {
                    localIdentifier: "wonMetric",
                    title: "Won",
                    value: "0",
                    format: "#,##0.00",
                    isDrillable: false,
                },
                tertiaryItem: {
                    localIdentifier: "tertiaryIdentifier",
                    value: null,
                    format: null,
                    title: "Versus",
                    isDrillable: false,
                },
            });
        });

        it("should set 0 for tertiary value when both primary & secondary are the same values except 0", () => {
            const intl = createIntlMock();

            const data = getHeadlineData(headlineWithTwoMeasuresBothSame.dataView, intl);
            expect(data).toEqual({
                primaryItem: {
                    localIdentifier: "lostMetric",
                    title: "Lost",
                    value: "100",
                    format: "#,##0.00",
                    isDrillable: false,
                },
                secondaryItem: {
                    localIdentifier: "wonMetric",
                    title: "Won",
                    value: "100",
                    format: "#,##0.00",
                    isDrillable: false,
                },
                tertiaryItem: {
                    localIdentifier: "tertiaryIdentifier",
                    value: "0",
                    format: null,
                    title: "Versus",
                    isDrillable: false,
                },
            });
        });
    });

    describe("applyDrillableItems", () => {
        it("should NOT throw any error when drillable items do not match defined headline or execution data", () => {
            const headlineData = {};
            const data = applyDrillableItems(
                headlineData as IHeadlineData,
                [uriMatch("some-uri")],
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
                [uriMatch("some-uri")],
                headlineWithTwoMeasures.dataView,
            );

            expect(updatedData).toEqual({
                primaryItem: {
                    localIdentifier: "m1",
                    title: "Lost",
                    value: "120",
                    isDrillable: false,
                },
            });
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
                [uriMatch("/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283")],
                headlineWithOneMeasure.dataView,
            );

            expect(data).toEqual({
                primaryItem: {
                    localIdentifier: "m1",
                    title: "Lost",
                    value: "120",
                    isDrillable: true,
                },
            });
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
                [identifierMatch("af2Ewj9Re2vK")],
                headlineWithOneMeasureWithIdentifier.dataView,
            );

            expect(data).toEqual({
                primaryItem: {
                    localIdentifier: "m1",
                    title: "Lost",
                    value: "120",
                    isDrillable: true,
                },
            });
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
                [uriMatch("/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1284")],
                headlineWithTwoMeasures.dataView,
            );

            expect(data).toEqual({
                secondaryItem: {
                    localIdentifier: "m2",
                    title: "Found",
                    value: "220",
                    isDrillable: true,
                },
            });
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
                [identifierMatch("afSEwRwdbMeQ")],
                headlineWithTwoMeasuresWithIdentifier.dataView,
            );

            expect(data).toEqual({
                secondaryItem: {
                    localIdentifier: "m2",
                    title: "Found",
                    value: "220",
                    isDrillable: true,
                },
            });
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
                    uriMatch("/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283"),
                    uriMatch("/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1284"),
                ],
                headlineWithTwoMeasures.dataView,
            );

            expect(data).toEqual({
                primaryItem: {
                    localIdentifier: "m1",
                    title: "Lost",
                    value: "120",
                    isDrillable: true,
                },
                secondaryItem: {
                    localIdentifier: "m2",
                    title: "Found",
                    value: "220",
                    isDrillable: true,
                },
            });
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
                [uriMatch("/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283")],
                headlineWithOneMeasure.dataView,
            );

            expect(updatedData).toEqual({
                primaryItem: {
                    localIdentifier: "m1",
                    title: "Lost",
                    value: "120",
                    isDrillable: true,
                },
            });
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
            expect(eventData).toEqual({
                dataView: headlineWithOneMeasure.dataView,
                drillContext: {
                    type: "headline",
                    element: "primaryValue",
                    value: "9011389.956",
                    intersection: [
                        {
                            id: "lostMetric",
                            title: "Lost",
                            header: {
                                uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283",
                                identifier: "",
                            },
                        },
                    ],
                },
            });
        });

        it("should build expected drill event data from execution request made with metric identifier", () => {
            const itemContext: IHeadlineDrillItemContext = {
                localIdentifier: "lostMetric",
                element: "primaryValue",
                value: "9011389.956",
            };
            const eventData = buildDrillEventData(itemContext, headlineWithOneMeasureWithIdentifier.dataView);
            expect(eventData).toEqual({
                dataView: headlineWithOneMeasureWithIdentifier.dataView,
                drillContext: {
                    type: "headline",
                    element: "primaryValue",
                    value: "9011389.956",
                    intersection: [
                        {
                            id: "lostMetric",
                            title: "Lost",
                            header: {
                                identifier: "af2Ewj9Re2vK",
                                uri: "",
                            },
                        },
                    ],
                },
            });
        });

        it("should build drill event data from execution for secondary value", () => {
            const itemContext: IHeadlineDrillItemContext = {
                localIdentifier: "wonMetric",
                element: "secondaryValue",
                value: "42470571.16",
            };
            const eventData = buildDrillEventData(itemContext, headlineWithTwoMeasures.dataView);
            expect(eventData).toEqual({
                dataView: headlineWithTwoMeasures.dataView,
                drillContext: {
                    type: "headline",
                    element: "secondaryValue",
                    value: "42470571.16",
                    intersection: [
                        {
                            id: "wonMetric",
                            title: "Won",
                            header: {
                                uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1284",
                                identifier: "",
                            },
                        },
                    ],
                },
            });
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

    describe("fireDrillEvent", () => {
        it("should dispatch expected drill post message", () => {
            const eventData = {
                dataView: {},
                drillContext: {},
            };
            const eventHandler = jest.fn();
            const target = {
                dispatchEvent: eventHandler,
            };

            fireDrillEvent(undefined, eventData as IDrillEvent2, (target as any) as EventTarget);

            expect(eventHandler).toHaveBeenCalledTimes(1);
            expect(eventHandler).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: {
                        dataView: {},
                        drillContext: {},
                    },
                    bubbles: true,
                    type: "drill",
                }),
            );
        });

        it("should dispatch expected drill event and post message to the provided target", () => {
            const eventData = {
                dataView: {},
                drillContext: {},
            };
            const eventHandler = jest.fn();
            const target = {
                dispatchEvent: eventHandler,
            };
            const drillEventFunction = jest.fn(() => true);

            fireDrillEvent(drillEventFunction, eventData as IDrillEvent2, (target as any) as EventTarget);

            expect(drillEventFunction).toHaveBeenCalledTimes(1);
            expect(eventHandler).toHaveBeenCalledTimes(1);
            expect(eventHandler).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: {
                        dataView: {},
                        drillContext: {},
                    },
                    bubbles: true,
                    type: "drill",
                }),
            );
        });

        it("should dispatch expected drill event, but prevent drill post message", () => {
            const eventData = {
                dataView: {},
                drillContext: {},
            };
            const eventHandler = jest.fn();
            const target = {
                dispatchEvent: eventHandler,
            };

            const drillEventFunction = jest.fn(() => false);

            fireDrillEvent(drillEventFunction, eventData as IDrillEvent2, (target as any) as EventTarget);

            expect(eventHandler).toHaveBeenCalledTimes(0);
            expect(drillEventFunction).toHaveBeenCalledTimes(1);
        });
    });
});
