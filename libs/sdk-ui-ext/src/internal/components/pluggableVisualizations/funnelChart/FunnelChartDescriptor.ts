// (C) 2021-2022 GoodData Corporation

import {
    IVisualizationDescriptor,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor";
import { PluggableFunnelChart } from "./PluggableFunnelChart";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor";
import { getReactEmbeddingCodeGenerator } from "../../../utils/embeddingCodeGenerator";
import {
    bucketConversion,
    getInsightToPropsConverter,
    insightConversion,
} from "../../../utils/embeddingCodeGenerator/insightToPropsConverter";
import { IFunnelChartBucketProps } from "@gooddata/sdk-ui-charts";
import { BucketNames } from "@gooddata/sdk-ui";
import { bucketMeasures, insightFilters, insightSorts, bucketAttribute } from "@gooddata/sdk-model";

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
        insightToProps: getInsightToPropsConverter<IFunnelChartBucketProps>({
            measures: bucketConversion("measures", BucketNames.MEASURES, bucketMeasures),
            viewBy: bucketConversion("viewBy", BucketNames.VIEW, bucketAttribute),
            filters: insightConversion("filters", insightFilters),
            sortBy: insightConversion("sortBy", insightSorts),
        }),
    });
}
