// (C) 2019 GoodData Corporation
import { IInsight } from "@gooddata/sdk-model";
import * as React from "react";
import { shallow } from "enzyme";
import ScatterPlotConfigurationPanel from "../ScatterPlotConfigurationPanel";
import { IConfigurationPanelContentProps } from "../ConfigurationPanelContent";
import ConfigSection from "../../configurationControls/ConfigSection";
import { DEFAULT_LOCALE } from "../../../../base/constants/localization";
import NameSubsection from "../../configurationControls/axis/NameSubsection";
import { VisualizationTypes } from "../../../..";

describe("ScatterPlotConfigurationPanel", () => {
    function createComponent(
        props: IConfigurationPanelContentProps = {
            locale: DEFAULT_LOCALE,
        },
    ) {
        return shallow<IConfigurationPanelContentProps, null>(<ScatterPlotConfigurationPanel {...props} />, {
            lifecycleExperimental: true,
        });
    }

    it("should render three sections in configuration panel for bubble chart", () => {
        const wrapper = createComponent();

        expect(wrapper.find(ConfigSection).length).toBe(3);
    });

    describe("axis name configuration", () => {
        const defaultProps: IConfigurationPanelContentProps = {
            isError: false,
            isLoading: false,
            locale: DEFAULT_LOCALE,
            type: VisualizationTypes.SCATTER,
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
    });
});
