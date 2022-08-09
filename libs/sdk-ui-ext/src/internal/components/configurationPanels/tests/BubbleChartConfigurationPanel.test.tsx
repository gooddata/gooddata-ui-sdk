// (C) 2019-2022 GoodData Corporation
import React from "react";
import { IInsightDefinition, newMeasure } from "@gooddata/sdk-model";
import { DefaultLocale, VisualizationTypes } from "@gooddata/sdk-ui";

import BubbleChartConfigurationPanel from "../BubbleChartConfigurationPanel";
import { IConfigurationPanelContentProps } from "../ConfigurationPanelContent";

import { insightWithSingleAttribute, insightWithSingleMeasure } from "../../../tests/mocks/testMocks";
import { setupComponent } from "../../../tests/testHelper";

describe("BubbleChartConfigurationPanel", () => {
    function createComponent(props: IConfigurationPanelContentProps) {
        return setupComponent(<BubbleChartConfigurationPanel {...props} />);
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

        const { getByLabelText } = createComponent(props);

        expect(getByLabelText("xaxis_section")).toBeInTheDocument();
        expect(getByLabelText("yaxis_section")).toBeInTheDocument();
    });

    it("should render configuration panel with disabled controls when it has no measures", () => {
        const props: IConfigurationPanelContentProps = {
            insight: insightWithSingleAttribute,
            isError: false,
            isLoading: false,
            locale: DefaultLocale,
        };

        const { getByLabelText } = createComponent(props);

        expect(getByLabelText("xaxis_section")).toBeDisabled();
        expect(getByLabelText("yaxis_section")).toBeDisabled();
    });

    it("should render configuration panel with disabled controls when it is in error state", () => {
        const props: IConfigurationPanelContentProps = {
            insight: insightWithSingleMeasure,
            isError: true,
            isLoading: false,
            locale: DefaultLocale,
        };

        const { getByLabelText } = createComponent(props);

        expect(getByLabelText("xaxis_section")).toBeDisabled();
        expect(getByLabelText("yaxis_section")).toBeDisabled();
    });

    it("should render configuration panel with disabled controls when it is loading", () => {
        const props: IConfigurationPanelContentProps = {
            insight: insightWithSingleMeasure,
            isError: false,
            isLoading: true,
            locale: DefaultLocale,
        };

        const { getByLabelText } = createComponent(props);

        expect(getByLabelText("xaxis_section")).toBeDisabled();
        expect(getByLabelText("yaxis_section")).toBeDisabled();
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

            const { getByLabelText, getByText, user } = createComponent({
                ...defaultProps,
                insight,
            });

            await user.click(getByText("X-Axis"));
            expect(getByLabelText("xaxis name")).toBeEnabled();

            await user.click(getByText("Y-Axis"));
            expect(getByLabelText("yaxis name")).toBeEnabled();
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

            const { getByLabelText, getByText, user } = createComponent({
                ...defaultProps,
                insight,
            });

            await user.click(getByText("X-Axis"));
            expect(getByLabelText("xaxis name")).toBeDisabled();

            await user.click(getByText("Y-Axis"));
            expect(getByLabelText("yaxis name")).toBeDisabled();
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

            const { getByLabelText, getByText, user } = createComponent({
                ...defaultProps,
                insight,
            });

            await user.click(getByText("X-Axis"));
            expect(getByLabelText("xaxis name")).toBeEnabled();

            await user.click(getByText("Y-Axis"));
            expect(getByLabelText("yaxis name")).toBeDisabled();
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
                const { getByLabelText, getByText, user } = createComponent({
                    ...defaultProps,
                    insight: newInsight(measureIdentifier),
                });

                await user.click(getByText("X-Axis"));
                expectedXAxisSectionDisabled
                    ? expect(getByLabelText("xaxis name")).toBeDisabled()
                    : expect(getByLabelText("xaxis name")).toBeEnabled();

                await user.click(getByText("Y-Axis"));
                expectedYAxisSectionDisabled
                    ? expect(getByLabelText("yaxis name")).toBeDisabled()
                    : expect(getByLabelText("yaxis name")).toBeEnabled();
            },
        );

        it("should not render name sections in configuration panel", async () => {
            const { queryByLabelText, getByText, user } = createComponent({
                ...defaultProps,
                featureFlags: {
                    enableAxisNameConfiguration: false,
                },
                insight: insightWithSingleAttribute,
            });

            await user.click(getByText("X-Axis"));
            expect(queryByLabelText("xaxis")).not.toBeInTheDocument();
        });
    });
});
