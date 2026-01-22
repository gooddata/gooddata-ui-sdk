// (C) 2021-2026 GoodData Corporation

import { BucketNames } from "@gooddata/sdk-ui";
import { type IPyramidChartProps } from "@gooddata/sdk-ui-charts";

import { PluggablePyramidChart } from "./PluggablePyramidChart.js";
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
    multipleAttributesOrMeasuresBucketConversion,
    singleAttributeBucketConversion,
    sortsInsightConversion,
} from "../../../utils/embeddingCodeGenerator/insightToPropsConverter/convenience.js";
import { getInsightToPropsConverter } from "../../../utils/embeddingCodeGenerator/insightToPropsConverter/convertor.js";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor.js";
import { chartAdditionalFactories, chartConfigInsightConversion } from "../chartCodeGenUtils.js";

export class PyramidChartDescriptor extends BaseChartDescriptor implements IVisualizationDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggablePyramidChart(params);
    }

    public getEmbeddingCode = getReactEmbeddingCodeGenerator({
        component: {
            importType: "named",
            name: "PyramidChart",
            package: "@gooddata/sdk-ui-charts",
        },
        insightToProps: getInsightToPropsConverter<IPyramidChartProps>({
            measures: multipleAttributesOrMeasuresBucketConversion("measures", BucketNames.MEASURES),
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
                "https://www.gooddata.com/docs/gooddata-ui/latest/references/visual_components/pyramid_chart",
            supportsExport: true,
            supportsZooming: false,
        };
    }
}
