// (C) 2021-2022 GoodData Corporation
import { bucketAttribute, bucketMeasure, insightFilters, insightSorts } from "@gooddata/sdk-model";
import {
    IVisualizationDescriptor,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor";
import { PluggableBubbleChart } from "./PluggableBubbleChart";
import { BigChartDescriptor } from "../BigChartDescriptor";
import { getReactEmbeddingCodeGenerator } from "../../../utils/embeddingCodeGenerator";
import { IBubbleChartBucketProps } from "@gooddata/sdk-ui-charts";
import { BucketNames } from "@gooddata/sdk-ui";
import {
    bucketConversion,
    getInsightToPropsConverter,
    insightConversion,
} from "../../../utils/embeddingCodeGenerator/insightToPropsConverter";
export class BubbleChartDescriptor extends BigChartDescriptor implements IVisualizationDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableBubbleChart(params);
    }

    public getEmbeddingCode = getReactEmbeddingCodeGenerator({
        component: {
            importType: "named",
            name: "BubbleChart",
            package: "@gooddata/sdk-ui-charts",
        },
        insightToProps: getInsightToPropsConverter<IBubbleChartBucketProps>({
            xAxisMeasure: bucketConversion("xAxisMeasure", BucketNames.MEASURES, bucketMeasure),
            yAxisMeasure: bucketConversion("yAxisMeasure", BucketNames.SECONDARY_MEASURES, bucketMeasure),
            size: bucketConversion("size", BucketNames.TERTIARY_MEASURES, bucketMeasure),
            viewBy: bucketConversion("viewBy", BucketNames.VIEW, bucketAttribute),
            filters: insightConversion("filters", insightFilters),
            sortBy: insightConversion("sortBy", insightSorts),
        }),
    });
}
