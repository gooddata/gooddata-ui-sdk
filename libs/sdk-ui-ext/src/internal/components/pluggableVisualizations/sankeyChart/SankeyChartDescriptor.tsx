// (C) 2022-2026 GoodData Corporation

import { BucketNames } from "@gooddata/sdk-ui";
import { type ISankeyChartProps } from "@gooddata/sdk-ui-charts";

import { PluggableSankeyChart } from "./PluggableSankeyChart.js";
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
    singleAttributeOrMeasureBucketConversion,
    sortsInsightConversion,
} from "../../../utils/embeddingCodeGenerator/insightToPropsConverter/convenience.js";
import { getInsightToPropsConverter } from "../../../utils/embeddingCodeGenerator/insightToPropsConverter/convertor.js";
import { BigChartDescriptor } from "../BigChartDescriptor.js";
import { chartAdditionalFactories, chartConfigInsightConversion } from "../chartCodeGenUtils.js";

export class SankeyChartDescriptor extends BigChartDescriptor implements IVisualizationDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableSankeyChart(params);
    }

    public getEmbeddingCode = getReactEmbeddingCodeGenerator({
        component: {
            importType: "named",
            name: "SankeyChart",
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

    public getMeta(): IVisualizationMeta {
        return {
            documentationUrl:
                "https://www.gooddata.com/docs/gooddata-ui/latest/references/visual_components/sankey_chart",
            supportsExport: true,
            supportsZooming: false,
        };
    }
}
