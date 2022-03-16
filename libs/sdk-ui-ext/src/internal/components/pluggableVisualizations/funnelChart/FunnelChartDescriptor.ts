// (C) 2021-2022 GoodData Corporation
import { IFunnelChartProps } from "@gooddata/sdk-ui-charts";
import { BucketNames } from "@gooddata/sdk-ui";
import { bucketMeasures, insightFilters, insightSorts, bucketAttribute } from "@gooddata/sdk-model";

import {
    IVisualizationDescriptor,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor";
import { PluggableFunnelChart } from "./PluggableFunnelChart";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor";
import {
    bucketConversion,
    chartConfigFromInsight,
    getInsightToPropsConverter,
    getReactEmbeddingCodeGenerator,
    insightConversion,
} from "../../../utils/embeddingCodeGenerator";

export class FunnelChartDescriptor extends BaseChartDescriptor implements IVisualizationDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableFunnelChart(params);
    }

    public getEmbeddingCode = getReactEmbeddingCodeGenerator({
        component: {
            importType: "named",
            name: "FunnelChart",
            package: "@gooddata/sdk-ui-charts",
        },
        insightToProps: getInsightToPropsConverter<IFunnelChartProps>({
            measures: bucketConversion("measures", BucketNames.MEASURES, bucketMeasures),
            viewBy: bucketConversion("viewBy", BucketNames.VIEW, bucketAttribute),
            filters: insightConversion("filters", insightFilters),
            sortBy: insightConversion("sortBy", insightSorts),
            config: insightConversion("config", chartConfigFromInsight),
        }),
    });
}
