// (C) 2019-2022 GoodData Corporation

import { IInsightDefinition } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { countBucketItems, countItemsOnAxes } from "../insightIntrospection";
import { IVisualizationProperties } from "../../../../interfaces/Visualization";

describe("countItemsOnAxesInMdObject", () => {
    it("should return number of items in buckets", () => {
        const insight: IInsightDefinition = {
            insight: {
                filters: [],
                properties: {},
                sorts: [],
                title: "My Insight",
                visualizationUrl: "vcId",
                buckets: [
                    { localIdentifier: BucketNames.VIEW, items: Array(2) },
                    { localIdentifier: BucketNames.MEASURES, items: Array(3) },
                    { localIdentifier: BucketNames.SECONDARY_MEASURES, items: Array(4) },
                ],
            },
        };
        const result = countBucketItems(insight);
        expect(result).toEqual({
            viewByItemCount: 2,
            measureItemCount: 3,
            secondaryMeasureItemCount: 4,
        });
    });
});

describe("countItemsOnAxes", () => {
    it("should return number of items on axes of column chart", () => {
        const insight: IInsightDefinition = {
            insight: {
                filters: [],
                properties: {},
                sorts: [],
                title: "My Insight",
                visualizationUrl: "vcId",
                buckets: [
                    { localIdentifier: BucketNames.VIEW, items: Array(2) },
                    { localIdentifier: BucketNames.MEASURES, items: Array(3) },
                ],
            },
        };
        const controls: IVisualizationProperties = {
            secondary_yaxis: {
                measures: Array(1),
            },
        };
        const result = countItemsOnAxes("column", controls, insight);
        expect(result).toEqual({
            xaxis: 2,
            yaxis: 2,
            secondary_yaxis: 1,
        });
    });

    it("should return number of items on axes of bar chart", () => {
        const insight: IInsightDefinition = {
            insight: {
                filters: [],
                properties: {},
                sorts: [],
                title: "My Insight",
                visualizationUrl: "vcId",
                buckets: [
                    { localIdentifier: BucketNames.VIEW, items: Array(2) },
                    { localIdentifier: BucketNames.MEASURES, items: Array(3) },
                ],
            },
        };
        const controls: IVisualizationProperties = {
            secondary_xaxis: {
                measures: Array(2),
            },
        };
        const result = countItemsOnAxes("bar", controls, insight);
        expect(result).toEqual({
            yaxis: 2,
            xaxis: 1,
            secondary_xaxis: 2,
        });
    });

    it("should return number of items on axes of combo chart", () => {
        const insight: IInsightDefinition = {
            insight: {
                filters: [],
                properties: {},
                sorts: [],
                title: "My Insight",
                visualizationUrl: "vcId",
                buckets: [
                    { localIdentifier: BucketNames.VIEW, items: Array(2) },
                    { localIdentifier: BucketNames.MEASURES, items: Array(3) },
                    { localIdentifier: BucketNames.SECONDARY_MEASURES, items: Array(4) },
                ],
            },
        };

        const controls: IVisualizationProperties = {
            secondary_yaxis: {
                measures: Array(4),
            },
        };
        const result = countItemsOnAxes("combo", controls, insight);
        expect(result).toEqual({
            xaxis: 2,
            yaxis: 3,
            secondary_yaxis: 4,
        });
    });
});
