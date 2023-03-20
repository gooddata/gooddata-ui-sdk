// (C) 2007-2023 GoodData Corporation
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import HeadlineTransformation, { IHeadlineTransformationProps } from "../HeadlineTransformation";
import * as headlineComponent from "../Headline";
import { withIntl } from "@gooddata/sdk-ui";
import {
    headlineWithOneMeasure,
    headlineWithOneMeasureWithIdentifier,
    headlineWithTwoMeasures,
    headlineWithTwoMeasuresWithIdentifier,
} from "../../../../../__mocks__/fixtures";
import {
    DRILL_EVENT_DATA_BY_MEASURE_IDENTIFIER,
    DRILL_EVENT_DATA_BY_MEASURE_URI,
    DRILL_EVENT_DATA_FOR_SECONDARY_ITEM,
} from "./HeadlineTransformation.fixtures";
import noop from "lodash/noop";

describe("HeadlineTransformation", () => {
    let Headline = jest.spyOn(headlineComponent, "default").mockImplementation(() => null);
    afterEach(() => {
        jest.restoreAllMocks();
        Headline = jest.spyOn(headlineComponent, "default").mockImplementation(() => null);
    });

    function createComponent(props: IHeadlineTransformationProps) {
        const WrappedHeadlineTransformation = withIntl(HeadlineTransformation);
        return render(<WrappedHeadlineTransformation {...props} />);
    }

    it("should pass default props to Headline component", () => {
        createComponent({
            dataView: headlineWithOneMeasure.dataView,
        });

        expect(Headline).toHaveBeenCalledWith(expect.objectContaining({ onAfterRender: noop }), {});
    });

    it("should pass disableDrillUnderline prop from config.disableDrillUnderline", () => {
        createComponent({
            dataView: headlineWithOneMeasure.dataView,
            config: {
                disableDrillUnderline: true,
            },
        });

        expect(Headline).toHaveBeenCalledWith(expect.objectContaining({ disableDrillUnderline: true }), {});
    });

    it("should pass all required props to Headline component and enable drilling identified by uri", () => {
        const onAfterRender = jest.fn();
        const drillableItems = [
            {
                uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283",
            },
        ];
        createComponent({
            dataView: headlineWithOneMeasure.dataView,
            drillableItems,
            onAfterRender,
        });

        expect(Headline).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
                    primaryItem: {
                        localIdentifier: "lostMetric",
                        title: "Lost",
                        value: "9011389.956",
                        format: "#,##0.00",
                        isDrillable: true,
                    },
                },
                onAfterRender,
                onDrill: expect.anything(),
            }),
            {},
        );
    });

    it("should pass all required props to Headline component and enable drilling identified by identifier", () => {
        const onAfterRender = jest.fn();
        const drillableItems = [
            {
                identifier: "af2Ewj9Re2vK",
            },
        ];
        createComponent({
            dataView: headlineWithOneMeasureWithIdentifier.dataView,
            drillableItems,
            onAfterRender,
        });

        expect(Headline).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
                    primaryItem: {
                        localIdentifier: "lostMetric",
                        title: "Lost",
                        value: "9011389.956",
                        format: "#,##0.00",
                        isDrillable: true,
                    },
                },
                onAfterRender,
                onDrill: expect.anything(),
            }),
            {},
        );
    });

    it("should pass primary, secondary and tertiary items to Headline component", () => {
        createComponent({
            dataView: headlineWithTwoMeasures.dataView,
        });

        expect(Headline).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
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
                        title: "Versus",
                        value: "-78.78203727929332",
                        format: null,
                        isDrillable: false,
                    },
                },
            }),
            {},
        );
    });

    it("should pass enabled drill eventing for primary and secondary items", () => {
        const drillableItems = [
            {
                uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283",
            },
            {
                uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1284",
            },
        ];
        createComponent({
            dataView: headlineWithTwoMeasures.dataView,
            drillableItems,
        });

        expect(Headline).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
                    primaryItem: {
                        localIdentifier: "lostMetric",
                        title: "Lost",
                        value: "9011389.956",
                        format: "#,##0.00",
                        isDrillable: true,
                    },
                    secondaryItem: {
                        localIdentifier: "wonMetric",
                        title: "Won",
                        value: "42470571.16",
                        format: "#,##0.00",
                        isDrillable: true,
                    },
                    tertiaryItem: {
                        localIdentifier: "tertiaryIdentifier",
                        title: "Versus",
                        value: "-78.78203727929332",
                        format: null,
                        isDrillable: false,
                    },
                },
                onDrill: expect.anything(),
            }),
            {},
        );
    });

    describe("drill eventing", () => {
        beforeEach(() => {
            jest.restoreAllMocks();
        });

        describe("for primary value", () => {
            it("should dispatch drill event and post message", () => {
                const drillEventFunction = jest.fn(() => true);
                createComponent({
                    dataView: headlineWithOneMeasure.dataView,
                    drillableItems: [
                        {
                            identifier: "af2Ewj9Re2vK",
                            uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283",
                        },
                    ],
                    onDrill: drillEventFunction,
                });
                const item = screen.getByText("9,011,389.96");
                const dispatchEventSpy = jest.spyOn(item, "dispatchEvent");

                fireEvent.click(item);

                expect(drillEventFunction).toHaveBeenCalledTimes(1);
                expect(drillEventFunction).toBeCalledWith(DRILL_EVENT_DATA_BY_MEASURE_URI);
                expect(dispatchEventSpy).toHaveBeenCalledTimes(2);
                expect((dispatchEventSpy.mock.calls[1][0] as any).bubbles).toEqual(true);
                expect((dispatchEventSpy.mock.calls[1][0] as any).type).toEqual("drill");
                expect((dispatchEventSpy.mock.calls[1][0] as any).detail).toEqual(
                    DRILL_EVENT_DATA_BY_MEASURE_URI,
                );
            });

            it("should dispatch only drill event", () => {
                const drillEventFunction = jest.fn(() => false);
                createComponent({
                    dataView: headlineWithOneMeasure.dataView,
                    drillableItems: [
                        {
                            identifier: "af2Ewj9Re2vK",
                            uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283",
                        },
                    ],
                    onDrill: drillEventFunction,
                });
                const item = screen.getByText("9,011,389.96");
                const dispatchEventSpy = jest.spyOn(item, "dispatchEvent");

                fireEvent.click(item);

                expect(drillEventFunction).toHaveBeenCalledTimes(1);
                expect(drillEventFunction).toBeCalledWith(DRILL_EVENT_DATA_BY_MEASURE_URI);
                expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
            });

            it("should dispatch drill event for adhoc measure by defined uri", () => {
                const drillEventFunction = jest.fn(() => false);
                createComponent({
                    dataView: headlineWithOneMeasure.dataView,
                    drillableItems: [
                        {
                            uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283",
                        },
                    ],
                    onDrill: drillEventFunction,
                });

                fireEvent.click(screen.getByText("9,011,389.96"));

                expect(drillEventFunction).toHaveBeenCalledTimes(1);
                expect(drillEventFunction).toBeCalledWith(DRILL_EVENT_DATA_BY_MEASURE_URI);
            });

            it("should dispatch drill event for adhoc measure by defined identifier", () => {
                const drillEventFunction = jest.fn(() => false);
                createComponent({
                    dataView: headlineWithOneMeasureWithIdentifier.dataView,
                    drillableItems: [
                        {
                            identifier: "af2Ewj9Re2vK",
                        },
                    ],
                    onDrill: drillEventFunction,
                });

                fireEvent.click(screen.getByText("9,011,389.96"));

                expect(drillEventFunction).toHaveBeenCalledTimes(1);
                expect(drillEventFunction).toBeCalledWith(DRILL_EVENT_DATA_BY_MEASURE_IDENTIFIER);
            });
        });

        describe("for secondary value", () => {
            it("should dispatch drill event and post message", () => {
                const drillEventFunction = jest.fn(() => true);
                createComponent({
                    dataView: headlineWithTwoMeasuresWithIdentifier.dataView,
                    drillableItems: [
                        {
                            identifier: "af2Ewj9Re2vK",
                        },
                        {
                            identifier: "afSEwRwdbMeQ",
                        },
                    ],
                    onDrill: drillEventFunction,
                });

                const item = screen.getByText("42,470,571.16");
                const dispatchEventSpy = jest.spyOn(item, "dispatchEvent");

                fireEvent.click(item);

                expect(drillEventFunction).toHaveBeenCalledTimes(1);
                expect(drillEventFunction).toBeCalledWith(DRILL_EVENT_DATA_FOR_SECONDARY_ITEM);
                expect(dispatchEventSpy).toHaveBeenCalledTimes(2);
                expect((dispatchEventSpy.mock.calls[1][0] as any).bubbles).toEqual(true);
                expect((dispatchEventSpy.mock.calls[1][0] as any).type).toEqual("drill");
                expect((dispatchEventSpy.mock.calls[1][0] as any).detail).toEqual(
                    DRILL_EVENT_DATA_FOR_SECONDARY_ITEM,
                );
            });
        });
    });
});
