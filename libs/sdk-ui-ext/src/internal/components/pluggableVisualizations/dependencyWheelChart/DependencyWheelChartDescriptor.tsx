// (C) 2023-2025 GoodData Corporation
import { BucketNames } from "@gooddata/sdk-ui";
import { type ISankeyChartProps } from "@gooddata/sdk-ui-charts";

import { PluggableDependencyWheelChart } from "./PluggableDependencyWheelChart.js";
import {
    type IVisualizationDescriptor,
    type IVisualizationMeta,
    type PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor.js";
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
    public override getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableDependencyWheelChart(params);
    }

    public override getEmbeddingCode = getReactEmbeddingCodeGenerator({
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

    public override getMeta(): IVisualizationMeta {
        return {
            documentationUrl:
                "https://www.gooddata.com/docs/gooddata-ui/latest/references/visual_components/dependency_wheel_chart",
            supportsExport: true,
            supportsZooming: false,
        };
    }
}
