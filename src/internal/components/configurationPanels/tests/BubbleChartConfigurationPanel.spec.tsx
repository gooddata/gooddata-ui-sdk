// (C) 2019 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";
import BubbleChartConfigurationPanel from "../BubbleChartConfigurationPanel";
import { IConfigurationPanelContentProps } from "../ConfigurationPanelContent";
import ConfigSection from "../../configurationControls/ConfigSection";
import { DEFAULT_LOCALE } from "../../../../constants/localization";

describe("BubbleChartconfigurationPanel", () => {
    function createComponent(props: IConfigurationPanelContentProps) {
        return shallow<IConfigurationPanelContentProps, null>(<BubbleChartConfigurationPanel {...props} />, {
            lifecycleExperimental: true,
        });
    }

    it("should render configuration panel with enabled controls", () => {
        const mdObject = {
            buckets: [
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
            ],
            visualizationClass: { uri: "visualization/class/uri" },
        };

        const props: IConfigurationPanelContentProps = {
            mdObject,
            isError: false,
            isLoading: false,
            locale: DEFAULT_LOCALE,
        };

        const wrapper = createComponent(props);
        const section = wrapper.find(ConfigSection).first();
        expect(section.props().toggleDisabled).toEqual(false);
    });

    it("should render configuration panel with disabled controls when it has no measures", () => {
        const mdObject = {
            buckets: [
                {
                    items: [
                        {
                            visualizationAttribute: {
                                displayForm: { uri: "df" },
                                localIdentifier: "attributeId",
                            },
                        },
                    ],
                },
            ],
            visualizationClass: { uri: "visualization/class/uri" },
        };

        const props: IConfigurationPanelContentProps = {
            mdObject,
            isError: false,
            isLoading: false,
            locale: DEFAULT_LOCALE,
        };

        const wrapper = createComponent(props);
        const section = wrapper.find(ConfigSection).first();
        expect(section.props().toggleDisabled).toEqual(true);
    });

    it("should render configuration panel with disabled controls when it is in error state", () => {
        const mdObject = {
            buckets: [
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
            ],
            visualizationClass: { uri: "visualization/class/uri" },
        };

        const props: IConfigurationPanelContentProps = {
            mdObject,
            isError: true,
            isLoading: false,
            locale: DEFAULT_LOCALE,
        };

        const wrapper = createComponent(props);
        const section = wrapper.find(ConfigSection).first();
        expect(section.props().toggleDisabled).toEqual(true);
    });

    it("should render configuration panel with disabled controls when it is loading", () => {
        const mdObject = {
            buckets: [
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
            ],
            visualizationClass: { uri: "visualization/class/uri" },
        };

        const props: IConfigurationPanelContentProps = {
            mdObject,
            isError: false,
            isLoading: true,
            locale: DEFAULT_LOCALE,
        };

        const wrapper = createComponent(props);
        const section = wrapper.find(ConfigSection).first();
        expect(section.props().toggleDisabled).toEqual(true);
    });
});
