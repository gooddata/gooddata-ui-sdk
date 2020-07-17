// (C) 2007-2018 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import HeadlineTransformation, { IHeadlineTransformationProps } from "../HeadlineTransformation";
import Headline from "../Headline";
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
    function createComponent(props: IHeadlineTransformationProps) {
        const WrappedHeadlineTransformation = withIntl(HeadlineTransformation);
        return mount(<WrappedHeadlineTransformation {...props} />);
    }

    it("should pass default props to Headline component", () => {
        const wrapper = createComponent({
            dataView: headlineWithOneMeasure.dataView,
        });

        const props = wrapper.find(Headline).props();
        expect(props.onAfterRender).toEqual(noop);
    });

    it("should pass disableDrillUnderline prop from config.disableDrillUnderline", () => {
        const wrapper = createComponent({
            dataView: headlineWithOneMeasure.dataView,
            config: {
                disableDrillUnderline: true,
            },
        });

        const headlineComponent = wrapper.find(Headline);
        expect(headlineComponent.prop("disableDrillUnderline")).toBeTruthy();
    });

    it("should pass all required props to Headline component and enable drilling identified by uri", () => {
        const onAfterRender = jest.fn();
        const drillableItems = [
            {
                uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283",
            },
        ];
        const wrapper = createComponent({
            dataView: headlineWithOneMeasure.dataView,
            drillableItems,
            onAfterRender,
        });

        const props = wrapper.find(Headline).props();
        expect(props.data).toEqual({
            primaryItem: {
                localIdentifier: "lostMetric",
                title: "Lost",
                value: "9011389.956",
                format: "#,##0.00",
                isDrillable: true,
            },
        });
        expect(props.onAfterRender).toEqual(onAfterRender);
        expect(props.onDrill).toBeDefined();
    });

    it("should pass all required props to Headline component and enable drilling identified by identifier", () => {
        const onAfterRender = jest.fn();
        const drillableItems = [
            {
                identifier: "af2Ewj9Re2vK",
            },
        ];
        const wrapper = createComponent({
            dataView: headlineWithOneMeasureWithIdentifier.dataView,
            drillableItems,
            onAfterRender,
        });

        const props = wrapper.find(Headline).props();
        expect(props.data).toEqual({
            primaryItem: {
                localIdentifier: "lostMetric",
                title: "Lost",
                value: "9011389.956",
                format: "#,##0.00",
                isDrillable: true,
            },
        });
        expect(props.onAfterRender).toEqual(onAfterRender);
        expect(props.onDrill).toBeDefined();
    });

    it("should pass primary, secondary and tertiary items to Headline component", () => {
        const wrapper = createComponent({
            dataView: headlineWithTwoMeasures.dataView,
        });

        const props = wrapper.find(Headline).props();
        expect(props.data).toEqual({
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
        });
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
        const wrapper = createComponent({
            dataView: headlineWithTwoMeasures.dataView,
            drillableItems,
        });

        const props = wrapper.find(Headline).props();
        expect(props.data).toEqual({
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
        });
        expect(props.onDrill).toBeDefined();
    });

    it("should call afterRender callback on componentDidMount & componentDidUpdate", () => {
        const onAfterRender = jest.fn();
        const wrapper = createComponent({
            dataView: headlineWithOneMeasure.dataView,
            onAfterRender,
        });

        expect(onAfterRender).toHaveBeenCalledTimes(1);

        wrapper.setProps({
            dataView: headlineWithOneMeasure.dataView,
        });

        expect(onAfterRender).toHaveBeenCalledTimes(2);
    });

    describe("drill eventing", () => {
        describe("for primary value", () => {
            it("should dispatch drill event and post message", () => {
                const drillEventFunction = jest.fn(() => true);

                const wrapper = createComponent({
                    dataView: headlineWithOneMeasure.dataView,
                    drillableItems: [
                        {
                            identifier: "af2Ewj9Re2vK",
                            uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283",
                        },
                    ],
                    onDrill: drillEventFunction,
                });

                const primaryValue = wrapper.find(".s-headline-primary-item .headline-value-wrapper");
                const clickEvent = { target: { dispatchEvent: jest.fn() } };
                primaryValue.simulate("click", clickEvent);

                expect(drillEventFunction).toHaveBeenCalledTimes(1);
                expect(drillEventFunction).toBeCalledWith(DRILL_EVENT_DATA_BY_MEASURE_URI);

                expect(clickEvent.target.dispatchEvent).toHaveBeenCalledTimes(1);
                const customEvent = clickEvent.target.dispatchEvent.mock.calls[0][0];
                expect(customEvent.bubbles).toBeTruthy();
                expect(customEvent.type).toEqual("drill");
                expect(customEvent.detail).toEqual(DRILL_EVENT_DATA_BY_MEASURE_URI);
            });

            it("should dispatch only drill event", () => {
                const drillEventFunction = jest.fn(() => false);

                const wrapper = createComponent({
                    dataView: headlineWithOneMeasure.dataView,
                    drillableItems: [
                        {
                            identifier: "af2Ewj9Re2vK",
                            uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283",
                        },
                    ],
                    onDrill: drillEventFunction,
                });

                const primaryValue = wrapper.find(".s-headline-primary-item .headline-value-wrapper");
                const clickEvent = { target: { dispatchEvent: jest.fn() } };
                primaryValue.simulate("click", clickEvent);

                expect(drillEventFunction).toHaveBeenCalledTimes(1);
                expect(drillEventFunction).toBeCalledWith(DRILL_EVENT_DATA_BY_MEASURE_URI);

                expect(clickEvent.target.dispatchEvent).toHaveBeenCalledTimes(0);
            });

            it("should dispatch drill event for adhoc measure by defined uri", () => {
                const drillEventFunction = jest.fn(() => false);

                const wrapper = createComponent({
                    dataView: headlineWithOneMeasure.dataView,
                    drillableItems: [
                        {
                            uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283",
                        },
                    ],
                    onDrill: drillEventFunction,
                });

                const primaryValue = wrapper.find(".s-headline-primary-item .headline-value-wrapper");
                const clickEvent = { target: { dispatchEvent: jest.fn() } };
                primaryValue.simulate("click", clickEvent);

                expect(drillEventFunction).toHaveBeenCalledTimes(1);
                expect(drillEventFunction).toBeCalledWith(DRILL_EVENT_DATA_BY_MEASURE_URI);
            });

            it("should dispatch drill event for adhoc measure by defined identifier", () => {
                const drillEventFunction = jest.fn(() => false);

                const wrapper = createComponent({
                    dataView: headlineWithOneMeasureWithIdentifier.dataView,
                    drillableItems: [
                        {
                            identifier: "af2Ewj9Re2vK",
                        },
                    ],
                    onDrill: drillEventFunction,
                });

                const primaryValue = wrapper.find(".s-headline-primary-item .headline-value-wrapper");
                const clickEvent = { target: { dispatchEvent: jest.fn() } };
                primaryValue.simulate("click", clickEvent);

                expect(drillEventFunction).toHaveBeenCalledTimes(1);
                expect(drillEventFunction).toBeCalledWith(DRILL_EVENT_DATA_BY_MEASURE_IDENTIFIER);
            });
        });
        describe("for secondary value", () => {
            it("should dispatch drill event and post message", () => {
                const drillEventFunction = jest.fn(() => true);

                const wrapper = createComponent({
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

                const primaryValue = wrapper.find(".s-headline-secondary-item");
                const clickEvent = { target: { dispatchEvent: jest.fn() } };
                primaryValue.simulate("click", clickEvent);

                expect(drillEventFunction).toHaveBeenCalledTimes(1);
                expect(drillEventFunction).toBeCalledWith(DRILL_EVENT_DATA_FOR_SECONDARY_ITEM);

                expect(clickEvent.target.dispatchEvent).toHaveBeenCalledTimes(1);
                const customEvent = clickEvent.target.dispatchEvent.mock.calls[0][0];
                expect(customEvent.bubbles).toBeTruthy();
                expect(customEvent.type).toEqual("drill");
                expect(customEvent.detail).toEqual(DRILL_EVENT_DATA_FOR_SECONDARY_ITEM);
            });
        });
    });
});
