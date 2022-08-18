// (C) 2019-2022 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IInsightDefinition, newMeasure } from "@gooddata/sdk-model";
import { DefaultLocale, VisualizationTypes } from "@gooddata/sdk-ui";

import BubbleChartConfigurationPanel from "../BubbleChartConfigurationPanel";
import { IConfigurationPanelContentProps } from "../ConfigurationPanelContent";

import { insightWithSingleAttribute, insightWithSingleMeasure } from "../../../tests/mocks/testMocks";

describe("BubbleChartConfigurationPanel", () => {
    function createComponent(props: IConfigurationPanelContentProps) {
        return render(<BubbleChartConfigurationPanel {...props} />);
    }
    function newInsight(measureBucket: string): IInsightDefinition {
        return {
            insight: {
                title: "My Insight",
                sorts: [],
                filters: [],
                visualizationUrl: "vc",
                properties: {},
                buckets: [
                    {
                        localIdentifier: measureBucket,
                        items: [newMeasure("testMeasure")],
                    },
                ],
            },
        };
    }
    it("should render configuration panel with enabled controls", () => {
        const props: IConfigurationPanelContentProps = {
            insight: insightWithSingleMeasure,
            isError: false,
            isLoading: false,
            locale: DefaultLocale,
        };

        createComponent(props);

        expect(screen.getByLabelText("xaxis_section")).toBeInTheDocument();
        expect(screen.getByLabelText("yaxis_section")).toBeInTheDocument();
    });

    it("should render configuration panel with disabled controls when it has no measures", () => {
        const props: IConfigurationPanelContentProps = {
            insight: insightWithSingleAttribute,
            isError: false,
            isLoading: false,
            locale: DefaultLocale,
        };

        createComponent(props);

        expect(screen.getByLabelText("xaxis_section")).toBeDisabled();
        expect(screen.getByLabelText("yaxis_section")).toBeDisabled();
    });

    it("should render configuration panel with disabled controls when it is in error state", () => {
        const props: IConfigurationPanelContentProps = {
            insight: insightWithSingleMeasure,
            isError: true,
            isLoading: false,
            locale: DefaultLocale,
        };

        createComponent(props);

        expect(screen.getByLabelText("xaxis_section")).toBeDisabled();
        expect(screen.getByLabelText("yaxis_section")).toBeDisabled();
    });

    it("should render configuration panel with disabled controls when it is loading", () => {
        const props: IConfigurationPanelContentProps = {
            insight: insightWithSingleMeasure,
            isError: false,
            isLoading: true,
            locale: DefaultLocale,
        };

        createComponent(props);

        expect(screen.getByLabelText("xaxis_section")).toBeDisabled();
        expect(screen.getByLabelText("yaxis_section")).toBeDisabled();
    });

    describe("axis name configuration", () => {
        const defaultProps: IConfigurationPanelContentProps = {
            isError: false,
            isLoading: false,
            locale: DefaultLocale,
            type: VisualizationTypes.BUBBLE,
            featureFlags: {
                enableAxisNameConfiguration: true,
            },
        };

        it("should render configuration panel with enabled name sections", async () => {
            const insight: IInsightDefinition = {
                insight: {
                    title: "My Insight",
                    sorts: [],
                    filters: [],
                    visualizationUrl: "vc",
                    properties: {},
                    buckets: [
                        {
                            localIdentifier: "measures",
                            items: [
                                {
                                    measure: {
                                        localIdentifier: "measureId",
                                        definition: {
                                            measureDefinition: {
                                                item: {
                                                    uri: "/gdc/md/projectId/obj/9211",
                                                },
                                            },
                                        },
                                    },
                                },
                            ],
                        },
                        {
                            localIdentifier: "secondary_measures",
                            items: [
                                {
                                    measure: {
                                        localIdentifier: "secondary_measureId",
                                        definition: {
                                            measureDefinition: {
                                                item: {
                                                    uri: "/gdc/md/projectId/obj/9203",
                                                },
                                            },
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
            };

            createComponent({
                ...defaultProps,
                insight,
            });

            await userEvent.click(screen.getByText("X-Axis"));
            expect(screen.getByLabelText("xaxis name")).toBeEnabled();

            await userEvent.click(screen.getByText("Y-Axis"));
            expect(screen.getByLabelText("yaxis name")).toBeEnabled();
        });

        it("should render configuration panel with disabled name sections", async () => {
            const insight: IInsightDefinition = {
                insight: {
                    title: "My Insight",
                    sorts: [],
                    filters: [],
                    visualizationUrl: "vc",
                    properties: {},
                    buckets: [],
                },
            };

            createComponent({
                ...defaultProps,
                insight,
            });

            await userEvent.click(screen.getByText("X-Axis"));
            expect(screen.getByLabelText("xaxis name")).toBeDisabled();

            await userEvent.click(screen.getByText("Y-Axis"));
            expect(screen.getByLabelText("yaxis name")).toBeDisabled();
        });

        it("should render configuration panel with enabled X axis name section and disabled Y axis name section", async () => {
            const insight: IInsightDefinition = {
                insight: {
                    title: "My Insight",
                    sorts: [],
                    filters: [],
                    visualizationUrl: "vc",
                    properties: {},
                    buckets: [
                        {
                            localIdentifier: "measures",
                            items: [
                                {
                                    measure: {
                                        localIdentifier: "measureId",
                                        definition: {
                                            measureDefinition: {
                                                item: {
                                                    uri: "/gdc/md/projectId/obj/9211",
                                                },
                                            },
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
            };

            createComponent({
                ...defaultProps,
                insight,
            });

            await userEvent.click(screen.getByText("X-Axis"));
            expect(screen.getByLabelText("xaxis name")).toBeEnabled();

            await userEvent.click(screen.getByText("Y-Axis"));
            expect(screen.getByLabelText("yaxis name")).toBeDisabled();
        });

        it.each([
            [false, true, "measures"],
            [true, false, "secondary_measures"],
        ])(
            "should render configuration panel with X axis name section is disabled=%s and Y axis name section is disabled=%s",
            async (
                expectedXAxisSectionDisabled: boolean,
                expectedYAxisSectionDisabled: boolean,
                measureIdentifier: string,
            ) => {
                createComponent({
                    ...defaultProps,
                    insight: newInsight(measureIdentifier),
                });

                await userEvent.click(screen.getByText("X-Axis"));
                expectedXAxisSectionDisabled
                    ? expect(screen.getByLabelText("xaxis name")).toBeDisabled()
                    : expect(screen.getByLabelText("xaxis name")).toBeEnabled();

                await userEvent.click(screen.getByText("Y-Axis"));
                expectedYAxisSectionDisabled
                    ? expect(screen.getByLabelText("yaxis name")).toBeDisabled()
                    : expect(screen.getByLabelText("yaxis name")).toBeEnabled();
            },
        );

        it("should not render name sections in configuration panel", async () => {
            createComponent({
                ...defaultProps,
                featureFlags: {
                    enableAxisNameConfiguration: false,
                },
                insight: insightWithSingleAttribute,
            });

            await userEvent.click(screen.getByText("X-Axis"));
            expect(screen.queryByLabelText("xaxis")).not.toBeInTheDocument();
        });
    });
});
