// (C) 2023 GoodData Corporation
import { BucketNames } from "@gooddata/sdk-ui";
import { ISankeyChartProps } from "@gooddata/sdk-ui-charts";
import {
    IVisualizationDescriptor,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor";
import { PluggableDependencyWheelChart } from "./PluggableDependencyWheelChart";
import {
    executionConfigInsightConversion,
    filtersInsightConversion,
    getInsightToPropsConverter,
    getReactEmbeddingCodeGenerator,
    localeInsightConversion,
    singleAttributeBucketConversion,
    singleAttributeOrMeasureBucketConversion,
    sortsInsightConversion,
} from "../../../utils/embeddingCodeGenerator";
import { chartAdditionalFactories, chartConfigInsightConversion } from "../chartCodeGenUtils";
import { SankeyChartDescriptor } from "../sankeyChart/SankeyChartDescriptor";

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
            attributeTo: singleAttributeBucketConversion("attributeTo", BucketNames.ATTRIBUTE_FROM),
            filters: filtersInsightConversion("filters"),
            sortBy: sortsInsightConversion("sortBy"),
            config: chartConfigInsightConversion("config"),
            locale: localeInsightConversion("locale"),
            execConfig: executionConfigInsightConversion("execConfig"),
        }),
        additionalFactories: chartAdditionalFactories(),
    });
}
