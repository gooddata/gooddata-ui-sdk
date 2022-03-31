// (C) 2021-2022 GoodData Corporation
import { IScatterPlotProps } from "@gooddata/sdk-ui-charts";
import { BucketNames } from "@gooddata/sdk-ui";

import { PluggableVisualizationFactory } from "../../../interfaces/VisualizationDescriptor";
import { PluggableScatterPlot } from "./PluggableScatterPlot";
import { BigChartDescriptor } from "../BigChartDescriptor";
import {
    filtersInsightConversion,
    getInsightToPropsConverter,
    getReactEmbeddingCodeGenerator,
    singleAttributeBucketConversion,
    singleMeasureBucketConversion,
    sortsInsightConversion,
} from "../../../utils/embeddingCodeGenerator";
import { chartAdditionalFactories, chartConfigInsightConversion } from "../chartCodeGenUtils";

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
            xAxisMeasure: singleMeasureBucketConversion("xAxisMeasure", BucketNames.MEASURES),
            yAxisMeasure: singleMeasureBucketConversion("yAxisMeasure", BucketNames.SECONDARY_MEASURES),
            attribute: singleAttributeBucketConversion("attribute", BucketNames.ATTRIBUTE),
            filters: filtersInsightConversion("filters"),
            sortBy: sortsInsightConversion("sortBy"),
            config: chartConfigInsightConversion("config"),
        }),
        additionalFactories: chartAdditionalFactories(),
    });
}
