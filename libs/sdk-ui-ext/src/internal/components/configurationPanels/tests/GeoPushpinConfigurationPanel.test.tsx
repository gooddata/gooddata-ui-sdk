// (C) 2020 GoodData Corporation
import React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import { IConfigurationPanelContentProps } from "../ConfigurationPanelContent";
import GeoPushpinConfigurationPanel from "../GeoPushpinConfigurationPanel";
import CheckboxControl from "../../configurationControls/CheckboxControl";
import PushpinSizeControl from "../../configurationControls/PushpinSizeControl";
import PushpinViewportControl from "../../configurationControls/PushpinViewportControl";
import LegendSection from "../../configurationControls/legend/LegendSection";
import ColorsSection from "../../configurationControls/colors/ColorsSection";
import { BucketNames, DefaultLocale, VisualizationTypes } from "@gooddata/sdk-ui";
import { ExamplesMd } from "@gooddata/live-examples-workspace";
import { IInsightDefinition, modifyMeasure, newBucket, newInsightDefinition } from "@gooddata/sdk-model";

const Location = ExamplesMd.City.Location;
const Size = ExamplesMd.Population.Sum;
const LocationBucket = newBucket(BucketNames.LOCATION, Location);
const SizeBucket = newBucket(BucketNames.SIZE, Size);

const InsightWithoutLocation: IInsightDefinition = newInsightDefinition("local:pushpin", (m) =>
    m.buckets([SizeBucket]),
);
const InsightForClustering: IInsightDefinition = newInsightDefinition("local:pushpin", (m) =>
    m.buckets([LocationBucket, newBucket(BucketNames.SIZE)]),
);
const InsightWithLocationAndSize: IInsightDefinition = newInsightDefinition("local:pushpin", (m) =>
    m.buckets([LocationBucket, SizeBucket]),
);

const DefaultInsight: IInsightDefinition = newInsightDefinition("local:pushpin", (m) => {
    return m.buckets([
        LocationBucket,
        newBucket(
            BucketNames.SIZE,
            modifyMeasure(ExamplesMd.Density.Sum, (m) => m.alias("Density").format("#,##0.00")),
        ),
    ]);
});

describe("GeoPushpinConfigurationPanel", () => {
    function createComponent(props: IConfigurationPanelContentProps): ShallowWrapper {
        return shallow<IConfigurationPanelContentProps, null>(<GeoPushpinConfigurationPanel {...props} />);
    }

    const defaultProps: IConfigurationPanelContentProps = {
        featureFlags: {
            enablePushpinGeoChart: true,
        },
        insight: DefaultInsight,
        isError: false,
        isLoading: false,
        locale: DefaultLocale,
        type: VisualizationTypes.PUSHPIN,
    };

    describe("Legend section", () => {
        it.each([
            ["disabled", "no location", true, InsightWithoutLocation],
            ["disabled", "no measure or segment", true, InsightForClustering],
            ["enabled", "measure or segment", false, InsightWithLocationAndSize],
        ])(
            "should %s Legend section when there is %s",
            async (
                _statusText: string,
                _conditionText: string,
                expectedStatus: boolean,
                insight: IInsightDefinition,
            ) => {
                const wrapper = createComponent({
                    ...defaultProps,
                    insight,
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
                insight: InsightWithoutLocation,
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
                insight: InsightForClustering,
            });

            const isDisabled = await wrapper.find(CheckboxControl).prop("disabled");
            expect(isDisabled).toEqual(false);
        });

        it("should render config panel with Point size section is disabled", async () => {
            const wrapper = createComponent({
                ...defaultProps,
                insight: InsightForClustering,
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
            insight: InsightWithoutLocation,
        });

        const isDisabled = await wrapper.find(ColorsSection).prop("controlsDisabled");
        expect(isDisabled).toEqual(true);
    });
});
