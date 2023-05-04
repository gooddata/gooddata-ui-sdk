// (C) 2022-2023 GoodData Corporation
import { BucketNames } from "@gooddata/sdk-ui";
import { ISankeyChartProps } from "@gooddata/sdk-ui-charts";
import {
    IVisualizationDescriptor,
    IVisualizationMeta,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor";
import { PluggableSankeyChart } from "./PluggableSankeyChart";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor";
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

export class SankeyChartDescriptor extends BaseChartDescriptor implements IVisualizationDescriptor {
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
            attributeTo: singleAttributeBucketConversion("attributeTo", BucketNames.ATTRIBUTE_FROM),
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
            supportsExport: true,
            supportsZooming: false,
        };
    }
}
