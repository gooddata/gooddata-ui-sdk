// (C) 2019 GoodData Corporation
import { IAttribute, IInsightDefinition, IMeasure } from "@gooddata/sdk-model";
import React from "react";
import { shallow } from "enzyme";
import { insightWithSingleAttribute } from "../../../tests/mocks/testMocks";
import BaseChartConfigurationPanel from "../BaseChartConfigurationPanel";
import { IConfigurationPanelContentProps } from "../ConfigurationPanelContent";
import NameSubsection from "../../configurationControls/axis/NameSubsection";
import { VisualizationTypes, DefaultLocale } from "@gooddata/sdk-ui";

describe("BaseChartConfigurationPanel", () => {
    describe("axis name configuration", () => {
        function createComponent(props: IConfigurationPanelContentProps) {
            return shallow<IConfigurationPanelContentProps, null>(
                <BaseChartConfigurationPanel {...props} />,
                {
                    lifecycleExperimental: true,
                },
            );
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

        it("should render configuration panel with enabled name sections in single axis chart", () => {
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

            const wrapper = createComponent({
                ...defaultProps,
                insight,
            });

            const axisSections = wrapper.find(NameSubsection);

            const xAxisSection = axisSections.at(0);
            expect(xAxisSection.props().disabled).toEqual(false);

            const yAxisSection = axisSections.at(1);
            expect(yAxisSection.props().disabled).toEqual(false);
        });

        it("should render configuration panel with enabled name sections in dual axis chart", () => {
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

            const wrapper = createComponent({
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

            const axisSections = wrapper.find(NameSubsection);

            const xAxisSection = axisSections.at(0);
            expect(xAxisSection.props().disabled).toEqual(false);

            const yAxisSection = axisSections.at(1);
            expect(yAxisSection.props().disabled).toEqual(false);

            const secondaryYAxisSection = axisSections.at(2);
            expect(secondaryYAxisSection.props().disabled).toEqual(false);
        });

        it("should render configuration panel with enabled X axis name section and disabled Y axis name section in single axis chart", () => {
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

            const wrapper = createComponent({
                ...defaultProps,
                insight,
            });

            const axisSections = wrapper.find(NameSubsection);

            const xAxisSection = axisSections.at(0);
            expect(xAxisSection.props().disabled).toEqual(false);

            const yAxisSection = axisSections.at(1);
            expect(yAxisSection.props().disabled).toEqual(true); // because of 2 measures on Y axis
        });

        it("should render configuration panel with disabled X axis name section and disabled Y axis name section in group-category chart", () => {
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

            const wrapper = createComponent({
                ...defaultProps,
                insight,
            });

            const axisSections = wrapper.find(NameSubsection);

            const xAxisSection = axisSections.at(0);
            expect(xAxisSection.props().disabled).toEqual(true); // because of 2 attributes on X axis

            const yAxisSection = axisSections.at(1);
            expect(yAxisSection.props().disabled).toEqual(true); // because of 2 measures on Y axis
        });

        it("should not render name sections in configuration panel", () => {
            const wrapper = createComponent({
                ...defaultProps,
                featureFlags: {
                    enableAxisNameConfiguration: false,
                },
                insight: insightWithSingleAttribute,
            });

            const axisSections = wrapper.find(NameSubsection);
            expect(axisSections.exists()).toEqual(false);
        });
    });
});
