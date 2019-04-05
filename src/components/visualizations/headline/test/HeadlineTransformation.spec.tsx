// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import noop = require("lodash/noop");
import { mount } from "enzyme";
import HeadlineTransformation, { IHeadlineTransformationProps } from "../HeadlineTransformation";
import {
    SINGLE_URI_METRIC_EXECUTION_REQUEST,
    SINGLE_METRIC_EXECUTION_RESPONSE,
    SINGLE_METRIC_EXECUTION_RESULT,
    SINGLE_IDENTIFIER_METRIC_EXECUTION_REQUEST,
    SINGLE_ADHOC_METRIC_EXECUTION_RESPONSE,
    SINGLE_ADHOC_METRIC_EXECUTION_RESULT,
} from "./fixtures/one_measure";
import Headline from "../Headline";
import {
    DRILL_EVENT_DATA_BY_MEASURE_IDENTIFIER,
    DRILL_EVENT_DATA_BY_MEASURE_URI,
    DRILL_EVENT_DATA_FOR_SECONDARY_ITEM,
} from "./fixtures/drill_event_data";
import { withIntl } from "../../utils/intlUtils";
import {
    TWO_MEASURES_EXECUTION_RESPONSE,
    TWO_MEASURES_EXECUTION_RESULT,
    TWO_MEASURES_WITH_IDENTIFIER_EXECUTION_REQUEST,
    TWO_MEASURES_WITH_URI_EXECUTION_REQUEST,
} from "./fixtures/two_measures";

describe("HeadlineTransformation", () => {
    function createComponent(props: IHeadlineTransformationProps) {
        const WrappedHeadlineTransformation = withIntl(HeadlineTransformation);
        return mount(<WrappedHeadlineTransformation {...props} />);
    }

    it("should pass default props to Headline component", () => {
        const wrapper = createComponent({
            executionRequest: SINGLE_URI_METRIC_EXECUTION_REQUEST,
            executionResponse: SINGLE_METRIC_EXECUTION_RESPONSE,
            executionResult: SINGLE_METRIC_EXECUTION_RESULT,
        });

        const props = wrapper.find(Headline).props();
        expect(props.onAfterRender).toEqual(noop);
    });

    it("should pass all required props to Headline component and enable drilling identified by uri", () => {
        const onAfterRender = jest.fn();
        const drillableItems = [
            {
                uri: "/gdc/md/project_id/obj/1",
            },
        ];
        const wrapper = createComponent({
            executionRequest: SINGLE_URI_METRIC_EXECUTION_REQUEST,
            executionResponse: SINGLE_METRIC_EXECUTION_RESPONSE,
            executionResult: SINGLE_METRIC_EXECUTION_RESULT,
            drillableItems,
            onAfterRender,
        });

        const props = wrapper.find(Headline).props();
        expect(props.data).toEqual({
            primaryItem: {
                localIdentifier: "m1",
                title: "Lost",
                value: "42470571.16",
                format: "$#,##0.00",
                isDrillable: true,
            },
        });
        expect(props.onAfterRender).toEqual(onAfterRender);
        expect(props.onFiredDrillEvent).toBeDefined();
    });

    it("should pass all required props to Headline component and enable drilling identified by identifier", () => {
        const onAfterRender = jest.fn();
        const drillableItems = [
            {
                identifier: "metric.lost",
            },
        ];
        const wrapper = createComponent({
            executionRequest: SINGLE_IDENTIFIER_METRIC_EXECUTION_REQUEST,
            executionResponse: SINGLE_METRIC_EXECUTION_RESPONSE,
            executionResult: SINGLE_METRIC_EXECUTION_RESULT,
            drillableItems,
            onAfterRender,
        });

        const props = wrapper.find(Headline).props();
        expect(props.data).toEqual({
            primaryItem: {
                localIdentifier: "m1",
                title: "Lost",
                value: "42470571.16",
                format: "$#,##0.00",
                isDrillable: true,
            },
        });
        expect(props.onAfterRender).toEqual(onAfterRender);
        expect(props.onFiredDrillEvent).toBeDefined();
    });

    it("should pass primary, secondary and tertiary items to Headline component", () => {
        const wrapper = createComponent({
            executionRequest: TWO_MEASURES_WITH_URI_EXECUTION_REQUEST,
            executionResponse: TWO_MEASURES_EXECUTION_RESPONSE,
            executionResult: TWO_MEASURES_EXECUTION_RESULT,
        });

        const props = wrapper.find(Headline).props();
        expect(props.data).toEqual({
            primaryItem: {
                localIdentifier: "m1",
                title: "Lost",
                value: "42470571.16",
                format: "$#,##0.00",
                isDrillable: false,
            },
            secondaryItem: {
                localIdentifier: "m2",
                title: "Found",
                value: "12345678",
                format: "$#,##0.00",
                isDrillable: false,
            },
            tertiaryItem: {
                localIdentifier: "tertiaryIdentifier",
                title: "Versus",
                value: "244.01165460495565",
                format: null,
                isDrillable: false,
            },
        });
    });

    it("should pass enabled drill eventing for primary and secondary items", () => {
        const drillableItems = [
            {
                uri: "/gdc/md/project_id/obj/1",
            },
            {
                uri: "/gdc/md/project_id/obj/2",
            },
        ];
        const wrapper = createComponent({
            executionRequest: TWO_MEASURES_WITH_URI_EXECUTION_REQUEST,
            executionResponse: TWO_MEASURES_EXECUTION_RESPONSE,
            executionResult: TWO_MEASURES_EXECUTION_RESULT,
            drillableItems,
        });

        const props = wrapper.find(Headline).props();
        expect(props.data).toEqual({
            primaryItem: {
                localIdentifier: "m1",
                title: "Lost",
                value: "42470571.16",
                format: "$#,##0.00",
                isDrillable: true,
            },
            secondaryItem: {
                localIdentifier: "m2",
                title: "Found",
                value: "12345678",
                format: "$#,##0.00",
                isDrillable: true,
            },
            tertiaryItem: {
                localIdentifier: "tertiaryIdentifier",
                title: "Versus",
                value: "244.01165460495565",
                format: null,
                isDrillable: false,
            },
        });
        expect(props.onFiredDrillEvent).toBeDefined();
    });

    it("should call afterRender callback on componentDidMount & componentDidUpdate", () => {
        const onAfterRender = jest.fn();
        const wrapper = createComponent({
            executionRequest: SINGLE_URI_METRIC_EXECUTION_REQUEST,
            executionResponse: SINGLE_METRIC_EXECUTION_RESPONSE,
            executionResult: SINGLE_METRIC_EXECUTION_RESULT,
            onAfterRender,
        });

        expect(onAfterRender).toHaveBeenCalledTimes(1);

        wrapper.setProps({
            executionRequest: SINGLE_URI_METRIC_EXECUTION_REQUEST,
        });

        expect(onAfterRender).toHaveBeenCalledTimes(2);
    });

    describe("drill eventing", () => {
        describe("for primary value", () => {
            it("should dispatch drill event and post message", () => {
                const drillEventFunction = jest.fn(() => true);

                const wrapper = createComponent({
                    executionRequest: SINGLE_URI_METRIC_EXECUTION_REQUEST,
                    executionResponse: SINGLE_METRIC_EXECUTION_RESPONSE,
                    executionResult: SINGLE_METRIC_EXECUTION_RESULT,
                    drillableItems: [
                        {
                            identifier: "metric.lost",
                            uri: "/gdc/md/project_id/obj/1",
                        },
                    ],
                    onFiredDrillEvent: drillEventFunction,
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
                    executionRequest: SINGLE_URI_METRIC_EXECUTION_REQUEST,
                    executionResponse: SINGLE_METRIC_EXECUTION_RESPONSE,
                    executionResult: SINGLE_METRIC_EXECUTION_RESULT,
                    drillableItems: [
                        {
                            identifier: "metric.lost",
                            uri: "/gdc/md/project_id/obj/1",
                        },
                    ],
                    onFiredDrillEvent: drillEventFunction,
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
                    executionRequest: SINGLE_URI_METRIC_EXECUTION_REQUEST,
                    executionResponse: SINGLE_ADHOC_METRIC_EXECUTION_RESPONSE,
                    executionResult: SINGLE_ADHOC_METRIC_EXECUTION_RESULT,
                    drillableItems: [
                        {
                            uri: "/gdc/md/project_id/obj/1",
                        },
                    ],
                    onFiredDrillEvent: drillEventFunction,
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
                    executionRequest: SINGLE_IDENTIFIER_METRIC_EXECUTION_REQUEST,
                    executionResponse: SINGLE_ADHOC_METRIC_EXECUTION_RESPONSE,
                    executionResult: SINGLE_ADHOC_METRIC_EXECUTION_RESULT,
                    drillableItems: [
                        {
                            identifier: "metric.lost",
                        },
                    ],
                    onFiredDrillEvent: drillEventFunction,
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
                    executionRequest: TWO_MEASURES_WITH_IDENTIFIER_EXECUTION_REQUEST,
                    executionResponse: TWO_MEASURES_EXECUTION_RESPONSE,
                    executionResult: TWO_MEASURES_EXECUTION_RESULT,
                    drillableItems: [
                        {
                            identifier: "measure.lost",
                        },
                        {
                            identifier: "measure.found",
                        },
                    ],
                    onFiredDrillEvent: drillEventFunction,
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
