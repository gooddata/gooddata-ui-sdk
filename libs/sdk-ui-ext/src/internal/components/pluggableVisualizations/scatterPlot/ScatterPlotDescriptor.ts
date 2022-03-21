// (C) 2021-2022 GoodData Corporation
import { IScatterPlotProps } from "@gooddata/sdk-ui-charts";
import { BucketNames } from "@gooddata/sdk-ui";
import { bucketAttribute, bucketMeasure, insightFilters, insightSorts } from "@gooddata/sdk-model";

import { PluggableVisualizationFactory } from "../../../interfaces/VisualizationDescriptor";
import { PluggableScatterPlot } from "./PluggableScatterPlot";
import { BigChartDescriptor } from "../BigChartDescriptor";
import {
    bucketConversion,
    chartAdditionalFactories,
    chartConfigPropMeta,
    getInsightToPropsConverter,
    getReactEmbeddingCodeGenerator,
    insightConversion,
} from "../../../utils/embeddingCodeGenerator";
import { chartConfigFromInsight } from "../chartConfigFromInsight";

export class ScatterPlotDescriptor extends BigChartDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableScatterPlot(params);
    }

    public getEmbeddingCode = getReactEmbeddingCodeGenerator({
        component: {
            importType: "named",
            name: "ScatterPlot",
            package: "@gooddata/sdk-ui-charts",
        },
        insightToProps: getInsightToPropsConverter<IScatterPlotProps>({
            xAxisMeasure: bucketConversion("xAxisMeasure", "IMeasure", BucketNames.MEASURES, bucketMeasure),
            yAxisMeasure: bucketConversion(
                "yAxisMeasure",
                "IMeasure",
                BucketNames.SECONDARY_MEASURES,
                bucketMeasure,
            ),
            attribute: bucketConversion("attribute", "IAttribute", BucketNames.ATTRIBUTE, bucketAttribute),
            filters: insightConversion("filters", "IFilter[]", insightFilters),
            sortBy: insightConversion("sortBy", "ISortItem[]", insightSorts),
            config: insightConversion("config", chartConfigPropMeta, chartConfigFromInsight),
        }),
        additionalFactories: chartAdditionalFactories,
    });
}
