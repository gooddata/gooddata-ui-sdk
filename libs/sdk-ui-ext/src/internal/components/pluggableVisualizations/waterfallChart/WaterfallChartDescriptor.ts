// (C) 2023 GoodData Corporation
import { IWaterfallChartProps } from "@gooddata/sdk-ui-charts";
import { BucketNames } from "@gooddata/sdk-ui";

import {
    IVisualizationDescriptor,
    IVisualizationMeta,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor";
import { PluggableWaterfallChart } from "./PluggableWaterfallChart";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor";
import {
    executionConfigInsightConversion,
    filtersInsightConversion,
    getInsightToPropsConverter,
    getReactEmbeddingCodeGenerator,
    localeInsightConversion,
    multipleAttributesOrMeasuresBucketConversion,
    singleAttributeBucketConversion,
    sortsInsightConversion,
} from "../../../utils/embeddingCodeGenerator";
import { chartAdditionalFactories, chartConfigInsightConversion } from "../chartCodeGenUtils";

export class WaterfallChartDescriptor extends BaseChartDescriptor implements IVisualizationDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableWaterfallChart(params);
    }

    public getEmbeddingCode = getReactEmbeddingCodeGenerator({
        component: {
            importType: "named",
            name: "WaterfallChart",
            package: "@gooddata/sdk-ui-charts",
        },
        insightToProps: getInsightToPropsConverter<IWaterfallChartProps>({
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
            documentationUrl: "https://sdk.gooddata.com/gooddata-ui/docs/waterfall_chart_component.html",
            supportsExport: true,
            supportsZooming: false,
        };
    }
}
