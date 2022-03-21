// (C) 2021-2022 GoodData Corporation
import { IPieChartProps } from "@gooddata/sdk-ui-charts";
import { BucketNames } from "@gooddata/sdk-ui";
import { bucketMeasures, insightFilters, insightSorts, bucketAttribute } from "@gooddata/sdk-model";

import {
    IVisualizationDescriptor,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor";
import { PluggablePieChart } from "./PluggablePieChart";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor";
import {
    bucketConversion,
    chartAdditionalFactories,
    chartConfigPropMeta,
    getInsightToPropsConverter,
    getReactEmbeddingCodeGenerator,
    insightConversion,
} from "../../../utils/embeddingCodeGenerator";
import { chartConfigFromInsight } from "../chartConfigFromInsight";

export class PieChartDescriptor extends BaseChartDescriptor implements IVisualizationDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggablePieChart(params);
    }

    public getEmbeddingCode = getReactEmbeddingCodeGenerator({
        component: {
            importType: "named",
            name: "PieChart",
            package: "@gooddata/sdk-ui-charts",
        },
        insightToProps: getInsightToPropsConverter<IPieChartProps>({
            measures: bucketConversion("measures", "IMeasure[]", BucketNames.MEASURES, bucketMeasures),
            viewBy: bucketConversion("viewBy", "IAttribute", BucketNames.VIEW, bucketAttribute),
            filters: insightConversion("filters", "IFilter[]", insightFilters),
            sortBy: insightConversion("sortBy", "ISortItem[]", insightSorts),
            config: insightConversion("config", chartConfigPropMeta, chartConfigFromInsight),
        }),
        additionalFactories: chartAdditionalFactories,
    });
}
