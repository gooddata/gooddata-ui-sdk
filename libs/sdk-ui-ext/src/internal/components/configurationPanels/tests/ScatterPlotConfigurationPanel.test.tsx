// (C) 2019-2022 GoodData Corporation
import React from "react";
import { IInsightDefinition, newMeasure } from "@gooddata/sdk-model";
import { DefaultLocale, VisualizationTypes } from "@gooddata/sdk-ui";

import ScatterPlotConfigurationPanel from "../ScatterPlotConfigurationPanel";
import { IConfigurationPanelContentProps } from "../ConfigurationPanelContent";

import { insightWithSingleAttribute } from "../../../tests/mocks/testMocks";
import { setupComponent } from "../../../tests/testHelper";

describe("ScatterPlotConfigurationPanel", () => {
    function createComponent(
        props: IConfigurationPanelContentProps = {
            locale: DefaultLocale,
        },
    ) {
        return setupComponent(<ScatterPlotConfigurationPanel {...props} />);
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

    it("should render three sections in configuration panel for bubble chart", () => {
        const { getByText } = createComponent();

        expect(getByText("X-Axis")).toBeInTheDocument();
        expect(getByText("Y-Axis")).toBeInTheDocument();
        expect(getByText("Canvas")).toBeInTheDocument();
    });

    describe("axis name configuration", () => {
        const defaultProps: IConfigurationPanelContentProps = {
            isError: false,
            isLoading: false,
            locale: DefaultLocale,
            type: VisualizationTypes.SCATTER,
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
