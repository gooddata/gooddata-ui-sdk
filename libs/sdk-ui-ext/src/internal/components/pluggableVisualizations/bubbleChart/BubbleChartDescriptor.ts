// (C) 2021-2022 GoodData Corporation
import { IBubbleChartProps } from "@gooddata/sdk-ui-charts";
import { BucketNames } from "@gooddata/sdk-ui";

import {
    IVisualizationDescriptor,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor";
import { PluggableBubbleChart } from "./PluggableBubbleChart";
import { BigChartDescriptor } from "../BigChartDescriptor";
import {
    filtersInsightConversion,
    getInsightToPropsConverter,
    getReactEmbeddingCodeGenerator,
    singleAttributeBucketConversion,
    singleMeasureBucketConversion,
    sortsInsightConversion,
} from "../../../utils/embeddingCodeGenerator";
import { chartAdditionalFactories, chartConfigInsightConversion } from "../chartCodeGenUtils";

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
        insightToProps: getInsightToPropsConverter<IBubbleChartProps>({
            xAxisMeasure: singleMeasureBucketConversion("xAxisMeasure", BucketNames.MEASURES),
            yAxisMeasure: singleMeasureBucketConversion("yAxisMeasure", BucketNames.SECONDARY_MEASURES),
            size: singleMeasureBucketConversion("size", BucketNames.TERTIARY_MEASURES),
            viewBy: singleAttributeBucketConversion("viewBy", BucketNames.VIEW),
            filters: filtersInsightConversion("filters"),
            sortBy: sortsInsightConversion("sortBy"),
            config: chartConfigInsightConversion("config"),
        }),
        additionalFactories: chartAdditionalFactories,
    });
}
