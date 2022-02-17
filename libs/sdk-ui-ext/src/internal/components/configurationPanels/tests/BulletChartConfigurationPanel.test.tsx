// (C) 2020-2022 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";
import BulletChartConfigurationPanel from "../BulletChartConfigurationPanel";
import { IConfigurationPanelContentProps } from "../ConfigurationPanelContent";
import NameSubsection from "../../configurationControls/axis/NameSubsection";
import ConfigSection from "../../configurationControls/ConfigSection";
import { attributeItemA1, attributeItemA2 } from "../../../tests/mocks/visualizationObjectMocks";
import LabelSubsection from "../../configurationControls/axis/LabelSubsection";
import { DefaultLocale, VisualizationTypes } from "@gooddata/sdk-ui";
import { IBucket, IInsightDefinition } from "@gooddata/sdk-model";
import { emptyInsight } from "../../../tests/mocks/testMocks";

function testInsight(buckets: IBucket[]): IInsightDefinition {
    return {
        insight: {
            visualizationUrl: "local:bullet",
            title: "test insight",
            filters: [],
            properties: {},
            sorts: [],
            buckets,
        },
    };
}

describe("BulletChartConfigurationPanel", () => {
    function createComponent(props: IConfigurationPanelContentProps) {
        return shallow<IConfigurationPanelContentProps, null>(<BulletChartConfigurationPanel {...props} />, {
            lifecycleExperimental: true,
        });
    }

    const testMeasure = {
        measure: {
            localIdentifier: "measure1",
            definition: {
                measureDefinition: {
                    item: {
                        uri: "/gdc/md/projectId/obj/9211",
                    },
                },
            },
        },
    };

    it("should render configuration panel with enabled controls", () => {
        const insight: IInsightDefinition = testInsight([
            {
                items: [
                    {
                        measure: {
                            definition: { measureDefinition: { item: { uri: "measure" } } },
                            localIdentifier: "measureId",
                        },
                    },
                ],
            },
        ]);

        const props: IConfigurationPanelContentProps = {
            insight,
            isError: false,
            isLoading: false,
            locale: DefaultLocale,
        };

        const wrapper = createComponent(props);
        const section = wrapper.find(ConfigSection).first();
        expect(section.props().toggleDisabled).toEqual(false);
    });

    it("should render configuration panel with disabled controls when it has no measures", () => {
        const insight = testInsight([
            {
                items: [
                    {
                        attribute: {
                            displayForm: { uri: "df" },
                            localIdentifier: "attributeId",
                        },
                    },
                ],
            },
        ]);

        const props: IConfigurationPanelContentProps = {
            insight,
            isError: false,
            isLoading: false,
            locale: DefaultLocale,
        };

        const wrapper = createComponent(props);
        const section = wrapper.find(ConfigSection).first();
        expect(section.props().toggleDisabled).toEqual(true);
    });

    it("should render configuration panel with disabled controls when it is in error state", () => {
        const insight = testInsight([
            {
                items: [
                    {
                        measure: {
                            definition: { measureDefinition: { item: { uri: "measure" } } },
                            localIdentifier: "measureId",
                        },
                    },
                ],
            },
        ]);

        const props: IConfigurationPanelContentProps = {
            insight,
            isError: true,
            isLoading: false,
            locale: DefaultLocale,
        };

        const wrapper = createComponent(props);
        const section = wrapper.find(ConfigSection).first();
        expect(section.props().toggleDisabled).toEqual(true);
    });

    it("should render configuration panel with disabled controls when it is loading", () => {
        const insight = testInsight([
            {
                items: [
                    {
                        measure: {
                            definition: { measureDefinition: { item: { uri: "measure" } } },
                            localIdentifier: "measureId",
                        },
                    },
                ],
            },
        ]);

        const props: IConfigurationPanelContentProps = {
            insight,
            isError: false,
            isLoading: true,
            locale: DefaultLocale,
        };

        const wrapper = createComponent(props);
        const section = wrapper.find(ConfigSection).first();
        expect(section.props().toggleDisabled).toEqual(true);
    });

    describe("axis name configuration", () => {
        const defaultProps: IConfigurationPanelContentProps = {
            featureFlags: {
                enableAxisNameConfiguration: true,
            },
            isError: false,
            isLoading: false,
            locale: DefaultLocale,
            type: VisualizationTypes.BULLET,
        };

        it("should render configuration panel with enabled name sections", () => {
            const insight = testInsight([
                {
                    localIdentifier: "measures",
                    items: [testMeasure],
                },
                {
                    localIdentifier: "view",
                    items: [attributeItemA1],
                },
            ]);

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

        it("should render configuration panel with disabled name sections", () => {
            const insight = emptyInsight;
            const wrapper = createComponent({
                ...defaultProps,
                insight,
            });

            const axisSections = wrapper.find(NameSubsection);

            const xAxisSection = axisSections.at(0);
            expect(xAxisSection.props().disabled).toBe(true);

            const yAxisSection = axisSections.at(1);
            expect(yAxisSection.props().disabled).toBe(true);
        });

        it("should render configuration panel with enabled X axis name section and disabled Y axis name section", () => {
            const insight = testInsight([
                {
                    localIdentifier: "measures",
                    items: [testMeasure],
                },
            ]);

            const wrapper = createComponent({
                ...defaultProps,
                insight,
            });

            const axisSections = wrapper.find(NameSubsection);

            const xAxisSection = axisSections.at(0);
            expect(xAxisSection.props().disabled).toBe(false);

            const yAxisSection = axisSections.at(1);
            expect(yAxisSection.props().disabled).toBe(true);
        });

        it("should not render name sections in configuration panel", () => {
            const wrapper = createComponent({
                ...defaultProps,
                featureFlags: {
                    enableAxisNameConfiguration: false,
                },
                insight: emptyInsight,
            });

            const axisSections = wrapper.find(NameSubsection);
            expect(axisSections.exists()).toEqual(false);
        });
    });

    describe("Y axis labels configuration", () => {
        const defaultProps: IConfigurationPanelContentProps = {
            isError: false,
            isLoading: false,
            locale: DefaultLocale,
            type: VisualizationTypes.BULLET,
        };

        it("should render labels configuration panel disabled if there is no attribute", () => {
            const insight = testInsight([
                {
                    localIdentifier: "measures",
                    items: [testMeasure],
                },
                {
                    localIdentifier: "view",
                    items: [],
                },
            ]);
            const wrapper = createComponent({
                ...defaultProps,
                insight,
            });

            const yAxisSection = wrapper.find(LabelSubsection).at(1);
            expect(yAxisSection.props().disabled).toEqual(true);
        });

        it("should render labels configuration panel enabled if there is an attribute", () => {
            const insight = testInsight([
                {
                    localIdentifier: "measures",
                    items: [testMeasure],
                },
                {
                    localIdentifier: "view",
                    items: [attributeItemA1],
                },
            ]);

            const wrapper = createComponent({
                ...defaultProps,
                insight,
            });

            const yAxisSection = wrapper.find(LabelSubsection).at(1);
            expect(yAxisSection.props().disabled).toEqual(false);
        });
    });

    describe("Y axis name configuration", () => {
        const defaultProps: IConfigurationPanelContentProps = {
            isError: false,
            isLoading: false,
            locale: DefaultLocale,
            type: VisualizationTypes.BULLET,
            featureFlags: {
                enableAxisNameConfiguration: true,
            },
        };

        it("should render name configuration panel enabled if there is an attribute", () => {
            const insight = testInsight([
                {
                    localIdentifier: "measures",
                    items: [testMeasure],
                },
                {
                    localIdentifier: "view",
                    items: [attributeItemA1],
                },
            ]);

            const wrapper = createComponent({
                ...defaultProps,
                insight,
            });

            const yAxisSection = wrapper.find(NameSubsection).at(1);
            expect(yAxisSection.props().disabled).toEqual(false);
        });

        it("should render name configuration panel disabled if there are two attributes", () => {
            const insight = testInsight([
                {
                    localIdentifier: "measures",
                    items: [testMeasure],
                },
                {
                    localIdentifier: "view",
                    items: [attributeItemA1, attributeItemA2],
                },
            ]);

            const wrapper = createComponent({
                ...defaultProps,
                insight,
            });

            const yAxisSection = wrapper.find(NameSubsection).at(1);
            expect(yAxisSection.props().disabled).toEqual(true);
        });

        it("should render name configuration panel enabled if there are two attributes and feature flag 'enableAxisNameViewByTwoAttributes' is true", () => {
            const insight = testInsight([
                {
                    localIdentifier: "measures",
                    items: [testMeasure],
                },
                {
                    localIdentifier: "view",
                    items: [attributeItemA1, attributeItemA2],
                },
            ]);

            const wrapper = createComponent({
                ...defaultProps,
                featureFlags: {
                    ...defaultProps.featureFlags,
                    enableAxisNameViewByTwoAttributes: true,
                },
                insight,
            });

            const yAxisSection = wrapper.find(NameSubsection).at(1);
            expect(yAxisSection.props().disabled).toEqual(false);
        });
    });
});
