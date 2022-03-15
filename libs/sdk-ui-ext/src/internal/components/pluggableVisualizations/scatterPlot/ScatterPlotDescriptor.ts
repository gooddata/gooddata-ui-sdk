// (C) 2021-2022 GoodData Corporation
import { PluggableVisualizationFactory } from "../../../interfaces/VisualizationDescriptor";
import { PluggableScatterPlot } from "./PluggableScatterPlot";
import { BigChartDescriptor } from "../BigChartDescriptor";
import { getReactEmbeddingCodeGenerator } from "../../../utils/embeddingCodeGenerator";
import { IScatterPlotProps } from "@gooddata/sdk-ui-charts";
import {
    bucketConversion,
    chartConfigFromInsight,
    getInsightToPropsConverter,
    insightConversion,
} from "../../../utils/embeddingCodeGenerator/insightToPropsConverter";
import { BucketNames } from "@gooddata/sdk-ui";
import { bucketAttribute, bucketMeasure, insightFilters, insightSorts } from "@gooddata/sdk-model";

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
            xAxisMeasure: bucketConversion("xAxisMeasure", BucketNames.MEASURES, bucketMeasure),
            yAxisMeasure: bucketConversion("yAxisMeasure", BucketNames.SECONDARY_MEASURES, bucketMeasure),
            attribute: bucketConversion("attribute", BucketNames.ATTRIBUTE, bucketAttribute),
            filters: insightConversion("filters", insightFilters),
            sortBy: insightConversion("sortBy", insightSorts),
            config: insightConversion("config", chartConfigFromInsight),
        }),
    });
}
