// (C) 2007-2025 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";
import HeadlineTransformation from "../LegacyHeadlineTransformation.js";
import * as headlineComponent from "../../headlines/LegacyHeadline.js";
import { withIntl } from "@gooddata/sdk-ui";
import {
    headlineWithOneMeasure,
    headlineWithOneMeasureWithIdentifier,
    headlineWithTwoMeasures,
    headlineWithTwoMeasuresWithIdentifier,
} from "../../../../../../__mocks__/fixtures.js";
import {
    DRILL_EVENT_DATA_BY_MEASURE_IDENTIFIER,
    DRILL_EVENT_DATA_BY_MEASURE_URI,
    DRILL_EVENT_DATA_FOR_SECONDARY_ITEM,
} from "./LegacyHeadlineTransformation.fixtures.js";
import noop from "lodash/noop.js";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { IHeadlineTransformationProps } from "../../../HeadlineProvider.js";

// Use a simple mock for LegacyHeadline
vi.mock("../../headlines/LegacyHeadline.js", () => {
    const MockHeadlineComponent = vi.fn().mockImplementation(() => null);
    return {
        default: MockHeadlineComponent,
    };
});

describe("HeadlineTransformation", () => {
    let Headline: any;
    let drillEventHandler: any;
    let savedOnDrillProp: any = null;

    beforeEach(() => {
        vi.clearAllMocks();

        // Get the mocked component
        Headline = vi.mocked(headlineComponent.default);

        // Setup a way to save the onDrill prop for testing
        Headline.mockImplementation((props) => {
            savedOnDrillProp = props.onDrill;
            return null;
        });

        // Create a drill event handler for testing
        drillEventHandler = vi.fn((event) => true);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        savedOnDrillProp = null;
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
        const onAfterRender = vi.fn();
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
        const onAfterRender = vi.fn();
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
        function simulateDrillEvent(data: any) {
            createComponent({
                dataView: data.dataView,
                drillableItems: [
                    {
                        identifier: "af2Ewj9Re2vK",
                        uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283",
                    },
                    {
                        identifier: "afSEwRwdbMeQ",
                        uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1284",
                    },
                ],
                onDrill: drillEventHandler,
            });

            // Verify we have the onDrill prop saved
            expect(savedOnDrillProp).toBeTruthy();

            // Call the saved onDrill with the test event data
            const mockEventContext = {
                localIdentifier: data.drillContext.intersection[0].header.measureHeaderItem.localIdentifier,
                value: data.drillContext.value,
                element: data.drillContext.element,
            };
            const mockDOMElement = document.createElement("div");

            // Call the onDrill handler that was passed to the LegacyHeadline component
            savedOnDrillProp(mockEventContext, mockDOMElement);

            // Verify the handler was called with the correct data
            expect(drillEventHandler).toHaveBeenCalledTimes(1);
            expect(drillEventHandler).toHaveBeenCalledWith(data);
        }

        it("should dispatch drill event for primary value", () => {
            simulateDrillEvent(DRILL_EVENT_DATA_BY_MEASURE_URI);
        });

        it("should dispatch drill event for adhoc measure by defined uri", () => {
            simulateDrillEvent(DRILL_EVENT_DATA_BY_MEASURE_URI);
        });

        it("should dispatch drill event for adhoc measure by defined identifier", () => {
            simulateDrillEvent(DRILL_EVENT_DATA_BY_MEASURE_IDENTIFIER);
        });

        it("should dispatch drill event for secondary value", () => {
            simulateDrillEvent(DRILL_EVENT_DATA_FOR_SECONDARY_ITEM);
        });
    });
});
