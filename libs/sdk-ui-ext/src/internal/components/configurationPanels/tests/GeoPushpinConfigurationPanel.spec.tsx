// (C) 2020 GoodData Corporation
import * as React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import { VisualizationObject } from "@gooddata/typings";
import { IConfigurationPanelContentProps } from "../ConfigurationPanelContent";
import { DEFAULT_LOCALE } from "../../../../constants/localization";
import { VisualizationTypes } from "../../../../constants/visualizationTypes";
import GeoPushpinConfigurationPanel from "../GeoPushpinConfigurationPanel";
import CheckboxControl from "../../configurationControls/CheckboxControl";
import PushpinSizeControl from "../../configurationControls/PushpinSizeControl";
import PushpinViewportControl from "../../configurationControls/PushpinViewportControl";
import LegendSection from "../../configurationControls/legend/LegendSection";
import ColorsSection from "../../configurationControls/colors/ColorsSection";

describe("GeoPushpinConfigurationPanel", () => {
    function createComponent(props: IConfigurationPanelContentProps): ShallowWrapper {
        return shallow<IConfigurationPanelContentProps, null>(<GeoPushpinConfigurationPanel {...props} />);
    }

    const locationItem = {
        visualizationAttribute: {
            localIdentifier: "379ed0c895204670b239ae36ac446b2a",
            displayForm: {
                uri: "/gdc/md/myproject/obj/695",
            },
        },
    };

    const sizeItem = {
        measure: {
            localIdentifier: "size",
            title: "Amount Avg",
            definition: {
                measureDefinition: {
                    item: {
                        uri: "/gdc/md/myproject/obj/8173",
                    },
                },
            },
        },
    };

    const noLocationMdObject = {
        buckets: [
            {
                localIdentifier: "size",
                items: [sizeItem],
            },
        ],
        visualizationClass: {
            uri: "/gdc/md/myproject/obj/952",
        },
    };

    const clusteringMdObject = {
        buckets: [
            {
                localIdentifier: "location",
                items: [locationItem],
            },
            {
                localIdentifier: "size",
                items: [],
            },
        ],
        visualizationClass: {
            uri: "/gdc/md/myproject/obj/952",
        },
    };

    const locationAndSizeMdObject = {
        buckets: [
            {
                localIdentifier: "location",
                items: [locationItem],
            },
            {
                localIdentifier: "size",
                items: [sizeItem],
            },
        ],
        visualizationClass: {
            uri: "/gdc/md/myproject/obj/952",
        },
    };

    const defaultProps: IConfigurationPanelContentProps = {
        featureFlags: {
            enablePushpinGeoChart: true,
        },
        mdObject: {
            buckets: [
                {
                    localIdentifier: "location",
                    items: [locationItem],
                },
                {
                    localIdentifier: "size",
                    items: [
                        {
                            measure: {
                                localIdentifier: "cbdaed9ab8314b5db96ab21114e807ea",
                                definition: {
                                    measureDefinition: {
                                        item: {
                                            uri: "/gdc/md/a8pxyfcimmbcgczhy0o4w775oabma8im/obj/698",
                                        },
                                        aggregation: "sum",
                                    },
                                },
                                title: "Sum of danso",
                                format: "#,##0.00",
                            },
                        },
                    ],
                },
            ],
            visualizationClass: {
                uri: "/gdc/md/a8pxyfcimmbcgczhy0o4w775oabma8im/obj/952",
            },
        },
        isError: false,
        isLoading: false,
        locale: DEFAULT_LOCALE,
        type: VisualizationTypes.PUSHPIN,
    };

    describe("Legend section", () => {
        it.each([
            ["disabled", "no location", true, noLocationMdObject],
            ["disabled", "no measure or segment", true, clusteringMdObject],
            ["enabled", "measure or segment", false, locationAndSizeMdObject],
        ])(
            "should %s Legend section when there is %s",
            async (
                _statusText: string,
                _conditionText: string,
                expectedStatus: boolean,
                mdObject: VisualizationObject.IVisualizationObjectContent,
            ) => {
                const wrapper = createComponent({
                    ...defaultProps,
                    mdObject,
                });

                const isDisabled = await wrapper.find(LegendSection).prop("controlsDisabled");
                expect(isDisabled).toEqual(expectedStatus);
            },
        );
    });

    describe("Map section", () => {
        it("should render config panel with Default viewport dropdown is disabled", async () => {
            const wrapper = createComponent({
                ...defaultProps,
                mdObject: noLocationMdObject,
            });

            const isDisabled = await wrapper.find(PushpinViewportControl).prop("disabled");
            expect(isDisabled).toEqual(true);
        });

        it("should render config panel with Default viewport dropdown is enabled", async () => {
            const wrapper = createComponent(defaultProps);

            const isDisabled = await wrapper.find(PushpinViewportControl).prop("disabled");
            expect(isDisabled).toEqual(false);
        });
    });

    describe("Points section", () => {
        it("should render config panel with groupNearbyPoints checkbox is disabled", async () => {
            const wrapper = createComponent(defaultProps);

            const isDisabled = await wrapper.find(CheckboxControl).prop("disabled");
            expect(isDisabled).toEqual(true);
        });

        it("should render config panel with groupNearbyPoints checkbox is enabled", async () => {
            const wrapper = createComponent({
                ...defaultProps,
                mdObject: clusteringMdObject,
            });

            const isDisabled = await wrapper.find(CheckboxControl).prop("disabled");
            expect(isDisabled).toEqual(false);
        });

        it("should render config panel with Point size section is disabled", async () => {
            const wrapper = createComponent({
                ...defaultProps,
                mdObject: clusteringMdObject,
            });

            const isDisabled = await wrapper.find(PushpinSizeControl).prop("disabled");
            expect(isDisabled).toEqual(true);
        });

        it("should render config panel with Point size section is enabled", async () => {
            const wrapper = createComponent(defaultProps);

            const isDisabled = await wrapper.find(PushpinSizeControl).prop("disabled");
            expect(isDisabled).toEqual(false);
        });
    });

    it("should render config panel with Color section is enabled", async () => {
        const wrapper = createComponent(defaultProps);

        const isDisabled = await wrapper.find(ColorsSection).prop("controlsDisabled");
        expect(isDisabled).toEqual(false);
    });

    it("should render config panel with Color section is disabled", async () => {
        const wrapper = createComponent({
            ...defaultProps,
            mdObject: noLocationMdObject,
        });

        const isDisabled = await wrapper.find(ColorsSection).prop("controlsDisabled");
        expect(isDisabled).toEqual(true);
    });
});
