// (C) 2019-2022 GoodData Corporation
import React from "react";
import { IAttribute, IInsightDefinition, IMeasure } from "@gooddata/sdk-model";
import { VisualizationTypes, DefaultLocale } from "@gooddata/sdk-ui";

import BaseChartConfigurationPanel from "../BaseChartConfigurationPanel";
import { IConfigurationPanelContentProps } from "../ConfigurationPanelContent";

import { setupComponent } from "../../../tests/testHelper";
import { insightWithSingleAttribute } from "../../../tests/mocks/testMocks";

describe("BaseChartConfigurationPanel", () => {
    describe("axis name configuration", () => {
        function createComponent(props: IConfigurationPanelContentProps) {
            return setupComponent(<BaseChartConfigurationPanel {...props} />);
        }

        const productAttribute: IAttribute = {
            attribute: {
                localIdentifier: "viewId",
                displayForm: { uri: "/gdc/md/projectId/obj/1024" },
            },
        };

        const regionAttribute: IAttribute = {
            attribute: {
                localIdentifier: "viewId2",
                displayForm: { uri: "/gdc/md/projectId/obj/1025" },
            },
        };

        const closeBOPMeasure: IMeasure = {
            measure: {
                localIdentifier: "measureId",
                definition: {
                    measureDefinition: {
                        item: { uri: "/gdc/md/projectId/obj/9211" },
                    },
                },
            },
        };

        const closeEOPMeasure: IMeasure = {
            measure: {
                localIdentifier: "measureId2",
                definition: {
                    measureDefinition: {
                        item: { uri: "/gdc/md/projectId/obj/9203" },
                    },
                },
            },
        };

        const defaultProps: IConfigurationPanelContentProps = {
            isError: false,
            isLoading: false,
            locale: DefaultLocale,
            type: VisualizationTypes.COLUMN,
            featureFlags: {
                enableAxisNameConfiguration: true,
            },
        };

        it("should render configuration panel with enabled name sections in single axis chart", async () => {
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
                            items: [closeBOPMeasure],
                        },
                        {
                            localIdentifier: "view",
                            items: [productAttribute],
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

        it("should render configuration panel with enabled name sections in dual axis chart", async () => {
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
                            items: [closeBOPMeasure, closeEOPMeasure],
                        },
                        {
                            localIdentifier: "view",
                            items: [productAttribute],
                        },
                    ],
                },
            };

            const { getByLabelText, getByText, user } = createComponent({
                ...defaultProps,
                insight,
                axis: "dual",
                properties: {
                    controls: {
                        secondary_yaxis: {
                            measures: ["measureId2"],
                        },
                    },
                },
            });

            await user.click(getByText("X-Axis"));
            expect(getByLabelText("xaxis name")).toBeEnabled();

            await user.click(getByText("Y-Axis (Left)"));
            expect(getByLabelText("yaxis name")).toBeEnabled();

            await user.click(getByText("Y-Axis (Right)"));
            expect(getByLabelText("yaxis name")).toBeEnabled();
        });

        it("should render configuration panel with enabled X axis name section and disabled Y axis name section in single axis chart", async () => {
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
                            items: [closeBOPMeasure, closeEOPMeasure],
                        },
                        {
                            localIdentifier: "view",
                            items: [productAttribute],
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
            expect(getByLabelText("yaxis name")).toBeDisabled(); // because of 2 measures on Y axis
        });

        it("should render configuration panel with disabled X axis name section and disabled Y axis name section in group-category chart", async () => {
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
                            items: [closeBOPMeasure, closeEOPMeasure],
                        },
                        {
                            localIdentifier: "view",
                            items: [productAttribute, regionAttribute],
                        },
                    ],
                },
            };

            const { getByLabelText, getByText, user } = createComponent({
                ...defaultProps,
                insight,
            });

            await user.click(getByText("X-Axis"));
            expect(getByLabelText("xaxis name")).toBeDisabled(); // because of 2 attributes on X axis

            await user.click(getByText("Y-Axis"));
            expect(getByLabelText("yaxis name")).toBeDisabled(); // because of 2 measures on Y axis
        });

        it("should not render name sections in configuration panel", async () => {
            const { queryByTestId, getByText, user } = createComponent({
                ...defaultProps,
                featureFlags: {
                    enableAxisNameConfiguration: false,
                },
                insight: insightWithSingleAttribute,
            });

            await user.click(getByText("X-Axis"));
            expect(queryByTestId("xaxis")).not.toBeInTheDocument();
        });
    });
});
