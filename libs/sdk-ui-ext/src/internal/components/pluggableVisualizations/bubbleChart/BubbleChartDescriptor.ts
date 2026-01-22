// (C) 2021-2026 GoodData Corporation

import { BucketNames } from "@gooddata/sdk-ui";
import { type IBubbleChartProps } from "@gooddata/sdk-ui-charts";

import { PluggableBubbleChart } from "./PluggableBubbleChart.js";
import {
    type IVisualizationDescriptor,
    type IVisualizationMeta,
    type PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor.js";
import { getReactEmbeddingCodeGenerator } from "../../../utils/embeddingCodeGenerator/getReactEmbeddingCodeGenerator.js";
import {
    executionConfigInsightConversion,
    filtersInsightConversion,
    localeInsightConversion,
    singleAttributeBucketConversion,
    singleMeasureBucketConversion,
    sortsInsightConversion,
} from "../../../utils/embeddingCodeGenerator/insightToPropsConverter/convenience.js";
import { getInsightToPropsConverter } from "../../../utils/embeddingCodeGenerator/insightToPropsConverter/convertor.js";
import { BigChartDescriptor } from "../BigChartDescriptor.js";
import { chartAdditionalFactories, chartConfigInsightConversion } from "../chartCodeGenUtils.js";

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
            locale: localeInsightConversion("locale"),
            execConfig: executionConfigInsightConversion("execConfig"),
        }),
        additionalFactories: chartAdditionalFactories(),
    });

    public getMeta(): IVisualizationMeta {
        return {
            documentationUrl:
                "https://www.gooddata.com/docs/gooddata-ui/latest/references/visual_components/bubble_chart",
            supportsExport: true,
            supportsZooming: true,
        };
    }
}
