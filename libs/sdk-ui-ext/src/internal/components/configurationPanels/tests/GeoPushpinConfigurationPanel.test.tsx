// (C) 2020-2022 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BucketNames, DefaultLocale, VisualizationTypes, DefaultColorPalette } from "@gooddata/sdk-ui";
import { ExamplesMd } from "@gooddata/live-examples-workspace";
import { IInsightDefinition, modifyMeasure, newBucket, newInsightDefinition } from "@gooddata/sdk-model";

import { IConfigurationPanelContentProps } from "../ConfigurationPanelContent";
import GeoPushpinConfigurationPanel from "../GeoPushpinConfigurationPanel";

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
        return render(<GeoPushpinConfigurationPanel {...props} />);
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
                createComponent({
                    ...defaultProps,
                    insight,
                });

                if (expectedStatus) {
                    expect(screen.getByLabelText("legend_section")).toBeDisabled();
                } else {
                    expect(screen.getByLabelText("legend_section")).toBeEnabled();
                }
            },
        );
    });

    describe("Map section", () => {
        it("should render config panel with Default viewport dropdown is disabled", async () => {
            createComponent({
                ...defaultProps,
                insight: InsightWithoutLocation,
            });

            await userEvent.click(screen.getByText("Map"));
            expect(screen.getByTitle("Include all data")).toHaveClass("disabled");
        });

        it("should render config panel with Default viewport dropdown is enabled", async () => {
            createComponent(defaultProps);

            await userEvent.click(screen.getByText("Map"));
            expect(screen.getByTitle("Include all data")).not.toHaveClass("disabled");
        });
    });

    describe("Points section", () => {
        it("should render config panel with groupNearbyPoints checkbox is disabled", async () => {
            createComponent(defaultProps);

            await userEvent.click(screen.getByText("Points"));
            expect(screen.getByLabelText("points.groupNearbyPoints")).toBeDisabled();
        });

        it("should render config panel with groupNearbyPoints checkbox is enabled", async () => {
            createComponent({
                ...defaultProps,
                insight: InsightForClustering,
            });

            await userEvent.click(screen.getByText("Points"));
            expect(screen.getByLabelText("points.groupNearbyPoints")).toBeEnabled();
        });
    });

    it("should render config panel with Color section is enabled", async () => {
        createComponent({ ...defaultProps, colors });

        await userEvent.click(screen.queryByText("Colors"));
        expect(screen.queryByText("Color 1")).toBeInTheDocument();
        expect(
            screen.queryByText("There are no colors for this configuration of the insight"),
        ).not.toBeInTheDocument();
    });

    it("should render config panel with Color section is disabled", async () => {
        createComponent({
            ...defaultProps,
            insight: InsightWithoutLocation,
        });
        await userEvent.click(screen.queryByText("Colors"));

        expect(
            screen.queryByText("There are no colors for this configuration of the insight"),
        ).toBeInTheDocument();
        expect(screen.queryByText("Color 1")).not.toBeInTheDocument();
    });
});
