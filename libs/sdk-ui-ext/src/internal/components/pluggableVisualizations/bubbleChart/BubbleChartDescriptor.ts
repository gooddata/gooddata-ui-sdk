// (C) 2021-2022 GoodData Corporation
import {
    bucketAttribute,
    bucketMeasure,
    insightBucket,
    insightFilters,
    insightSorts,
} from "@gooddata/sdk-model";
import {
    IVisualizationDescriptor,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor";
import { PluggableBubbleChart } from "./PluggableBubbleChart";
import { BigChartDescriptor } from "../BigChartDescriptor";
import { getReactEmbeddingCodeGenerator } from "../../../utils/embeddingCodeGenerator";
import { IBubbleChartBucketProps } from "@gooddata/sdk-ui-charts";
import { BucketNames } from "@gooddata/sdk-ui";

export class BubbleChartDescriptor extends BigChartDescriptor implements IVisualizationDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableBubbleChart(params);
    }

    public getEmbeddingCode = getReactEmbeddingCodeGenerator(
        {
            importType: "named",
            name: "BubbleChart",
            package: "@gooddata/sdk-ui-charts",
        },
        (insight): IBubbleChartBucketProps => {
            const measureBucket = insightBucket(insight, BucketNames.MEASURES);
            const secondaryMeasureBucket = insightBucket(insight, BucketNames.SECONDARY_MEASURES);
            const tertiaryMeasureBucket = insightBucket(insight, BucketNames.TERTIARY_MEASURES);
            const viewBucket = insightBucket(insight, BucketNames.VIEW);

            const xAxisMeasure = measureBucket && bucketMeasure(measureBucket);
            const yAxisMeasure = secondaryMeasureBucket && bucketMeasure(secondaryMeasureBucket);
            const size = tertiaryMeasureBucket && bucketMeasure(tertiaryMeasureBucket);
            const viewBy = viewBucket && bucketAttribute(viewBucket);
            const filters = insightFilters(insight);
            const sortBy = insightSorts(insight);

            return {
                xAxisMeasure,
                yAxisMeasure,
                size,
                viewBy,
                filters,
                sortBy,
            };
        },
    );
}
