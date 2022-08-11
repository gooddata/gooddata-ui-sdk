// (C) 2020-2022 GoodData Corporation
import React from "react";
import { BucketNames, DefaultLocale, VisualizationTypes, DefaultColorPalette } from "@gooddata/sdk-ui";
import { ExamplesMd } from "@gooddata/live-examples-workspace";
import { IInsightDefinition, modifyMeasure, newBucket, newInsightDefinition } from "@gooddata/sdk-model";

import { IConfigurationPanelContentProps } from "../ConfigurationPanelContent";
import GeoPushpinConfigurationPanel from "../GeoPushpinConfigurationPanel";

import { setupComponent } from "../../../tests/testHelper";
import { IColorConfiguration } from "../../../interfaces/Colors";

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

const colors: IColorConfiguration = {
    colorPalette: DefaultColorPalette,
    colorAssignments: [
        {
            headerItem: { attributeHeaderItem: { uri: "/ahi1", name: "Color 1" } },
            color: {
                type: "guid",
                value: "4",
            },
        },
        {
            headerItem: { attributeHeaderItem: { uri: "/ahi2", name: "Color 2" } },
            color: {
                type: "guid",
                value: "5",
            },
        },
    ],
};

describe("GeoPushpinConfigurationPanel", () => {
    function createComponent(props: IConfigurationPanelContentProps) {
        return setupComponent(<GeoPushpinConfigurationPanel {...props} />);
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
                const { getByLabelText } = createComponent({
                    ...defaultProps,
                    insight,
                });

                if (expectedStatus) {
                    expect(getByLabelText("legend_section")).toBeDisabled();
                } else {
                    expect(getByLabelText("legend_section")).toBeEnabled();
                }
            },
        );
    });

    describe("Map section", () => {
        it("should render config panel with Default viewport dropdown is disabled", async () => {
            const { getByText, getByTitle, user } = createComponent({
                ...defaultProps,
                insight: InsightWithoutLocation,
            });

            await user.click(getByText("Map"));
            expect(getByTitle("Include all data")).toHaveClass("disabled");
        });

        it("should render config panel with Default viewport dropdown is enabled", async () => {
            const { getByText, getByTitle, user } = createComponent(defaultProps);

            await user.click(getByText("Map"));
            expect(getByTitle("Include all data")).not.toHaveClass("disabled");
        });
    });

    describe("Points section", () => {
        it("should render config panel with groupNearbyPoints checkbox is disabled", async () => {
            const { getByText, getByLabelText, user } = createComponent(defaultProps);

            await user.click(getByText("Points"));
            expect(getByLabelText("points.groupNearbyPoints")).toBeDisabled();
        });

        it("should render config panel with groupNearbyPoints checkbox is enabled", async () => {
            const { getByText, getByLabelText, user } = createComponent({
                ...defaultProps,
                insight: InsightForClustering,
            });

            await user.click(getByText("Points"));
            expect(getByLabelText("points.groupNearbyPoints")).toBeEnabled();
        });
    });

    it("should render config panel with Color section is enabled", async () => {
        const { queryByText, user } = createComponent({ ...defaultProps, colors });

        await user.click(queryByText("Colors"));
        expect(queryByText("Color 1")).toBeInTheDocument();
        expect(
            queryByText("There are no colors for this configuration of the insight"),
        ).not.toBeInTheDocument();
    });

    it("should render config panel with Color section is disabled", async () => {
        const { queryByText, user } = createComponent({
            ...defaultProps,
            insight: InsightWithoutLocation,
        });
        await user.click(queryByText("Colors"));

        expect(queryByText("There are no colors for this configuration of the insight")).toBeInTheDocument();
        expect(queryByText("Color 1")).not.toBeInTheDocument();
    });
});
