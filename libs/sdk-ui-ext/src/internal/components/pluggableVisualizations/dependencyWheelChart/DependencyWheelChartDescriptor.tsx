// (C) 2023 GoodData Corporation
import { BucketNames } from "@gooddata/sdk-ui";
import { ISankeyChartProps } from "@gooddata/sdk-ui-charts";
import {
    IVisualizationDescriptor,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor.js";
import { PluggableDependencyWheelChart } from "./PluggableDependencyWheelChart.js";
import {
    executionConfigInsightConversion,
    filtersInsightConversion,
    getInsightToPropsConverter,
    getReactEmbeddingCodeGenerator,
    localeInsightConversion,
    singleAttributeBucketConversion,
    singleAttributeOrMeasureBucketConversion,
    sortsInsightConversion,
} from "../../../utils/embeddingCodeGenerator/index.js";
import { chartAdditionalFactories, chartConfigInsightConversion } from "../chartCodeGenUtils.js";
import { SankeyChartDescriptor } from "../sankeyChart/SankeyChartDescriptor.js";

export class DependencyWheelChartDescriptor
    extends SankeyChartDescriptor
    implements IVisualizationDescriptor
{
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableDependencyWheelChart(params);
    }

    public getEmbeddingCode = getReactEmbeddingCodeGenerator({
        component: {
            importType: "named",
            name: "DependencyWheelChart",
            package: "@gooddata/sdk-ui-charts",
        },
        insightToProps: getInsightToPropsConverter<ISankeyChartProps>({
            measure: singleAttributeOrMeasureBucketConversion("measure", BucketNames.MEASURES),
            attributeFrom: singleAttributeBucketConversion("attributeFrom", BucketNames.ATTRIBUTE_FROM),
            attributeTo: singleAttributeBucketConversion("attributeTo", BucketNames.ATTRIBUTE_TO),
            filters: filtersInsightConversion("filters"),
            sortBy: sortsInsightConversion("sortBy"),
            config: chartConfigInsightConversion("config"),
            locale: localeInsightConversion("locale"),
            execConfig: executionConfigInsightConversion("execConfig"),
        }),
        additionalFactories: chartAdditionalFactories(),
    });
}
