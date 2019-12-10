// (C) 2019 GoodData Corporation
import { IInsight, newMeasure } from "@gooddata/sdk-model";
import { shallow } from "enzyme";
import * as React from "react";
import { VisualizationTypes } from "../../../..";
import { DEFAULT_LOCALE } from "../../../../base/constants/localization";
import { insightWithSingleAttribute, insightWithSingleMeasure } from "../../../mocks/testMocks";
import NameSubsection from "../../configurationControls/axis/NameSubsection";
import ConfigSection from "../../configurationControls/ConfigSection";
import BubbleChartConfigurationPanel from "../BubbleChartConfigurationPanel";
import { IConfigurationPanelContentProps } from "../ConfigurationPanelContent";

describe("BubbleChartconfigurationPanel", () => {
    function createComponent(props: IConfigurationPanelContentProps) {
        return shallow<IConfigurationPanelContentProps, null>(<BubbleChartConfigurationPanel {...props} />, {
            lifecycleExperimental: true,
        });
    }

    function newInsight(measureBucket: string): IInsight {
        return {
            insight: {
                title: "My Insight",
                sorts: [],
                filters: [],
                visualizationClassIdentifier: "vc",
                properties: {},
                identifier: "id",
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
            locale: DEFAULT_LOCALE,
        };

        const wrapper = createComponent(props);
        const section = wrapper.find(ConfigSection).first();
        expect(section.props().toggleDisabled).toEqual(false);
    });

    it("should render configuration panel with disabled controls when it has no measures", () => {
        const props: IConfigurationPanelContentProps = {
            insight: insightWithSingleAttribute,
            isError: false,
            isLoading: false,
            locale: DEFAULT_LOCALE,
        };

        const wrapper = createComponent(props);
        const section = wrapper.find(ConfigSection).first();
        expect(section.props().toggleDisabled).toEqual(true);
    });

    it("should render configuration panel with disabled controls when it is in error state", () => {
        const props: IConfigurationPanelContentProps = {
            insight: insightWithSingleMeasure,
            isError: true,
            isLoading: false,
            locale: DEFAULT_LOCALE,
        };

        const wrapper = createComponent(props);
        const section = wrapper.find(ConfigSection).first();
        expect(section.props().toggleDisabled).toEqual(true);
    });

    it("should render configuration panel with disabled controls when it is loading", () => {
        const props: IConfigurationPanelContentProps = {
            insight: insightWithSingleMeasure,
            isError: false,
            isLoading: true,
            locale: DEFAULT_LOCALE,
        };

        const wrapper = createComponent(props);
        const section = wrapper.find(ConfigSection).first();
        expect(section.props().toggleDisabled).toEqual(true);
    });

    describe("axis name configuration", () => {
        const defaultProps: IConfigurationPanelContentProps = {
            isError: false,
            isLoading: false,
            locale: DEFAULT_LOCALE,
            type: VisualizationTypes.BUBBLE,
            featureFlags: {
                enableAxisNameConfiguration: true,
            },
        };

        it("should render configuration panel with enabled name sections", () => {
            const insight: IInsight = {
                insight: {
                    title: "My Insight",
                    sorts: [],
                    filters: [],
                    visualizationClassIdentifier: "vc",
                    properties: {},
                    identifier: "id",
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
            const insight: IInsight = {
                insight: {
                    title: "My Insight",
                    sorts: [],
                    filters: [],
                    visualizationClassIdentifier: "vc",
                    properties: {},
                    identifier: "id",
                    buckets: [] as any,
                },
            };

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
            const insight: IInsight = {
                insight: {
                    title: "My Insight",
                    sorts: [],
                    filters: [],
                    visualizationClassIdentifier: "vc",
                    properties: {},
                    identifier: "id",
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

            const wrapper = createComponent({
                ...defaultProps,
                insight,
            });

            const axisSections = wrapper.find(NameSubsection);

            const xAxisSection = axisSections.at(0);
            expect(xAxisSection.props().disabled).toEqual(false);

            const yAxisSection = axisSections.at(1);
            expect(yAxisSection.props().disabled).toEqual(true);
        });

        it.each([[false, true, "measures"], [true, false, "secondary_measures"]])(
            "should render configuration panel with X axis name section is disabled=%s and Y axis name section is disabled=%s",
            (
                expectedXAxisSectionDisabled: boolean,
                expectedYAxisSectionDisabled: boolean,
                measureIdentifier: string,
            ) => {
                const wrapper = createComponent({
                    ...defaultProps,
                    insight: newInsight(measureIdentifier),
                });

                const axisSections = wrapper.find(NameSubsection);

                const xAxisSection = axisSections.at(0);
                expect(xAxisSection.props().disabled).toEqual(expectedXAxisSectionDisabled);

                const yAxisSection = axisSections.at(1);
                expect(yAxisSection.props().disabled).toEqual(expectedYAxisSectionDisabled);
            },
        );

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
