// (C) 2021-2022 GoodData Corporation
import { IComboChartProps } from "@gooddata/sdk-ui-charts";
import { BucketNames } from "@gooddata/sdk-ui";
import { bucketMeasures, bucketAttributes, insightFilters, insightSorts } from "@gooddata/sdk-model";

import {
    IVisualizationDescriptor,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor";
import { PluggableComboChart } from "./PluggableComboChart";
import { BigChartDescriptor } from "../BigChartDescriptor";
import {
    getReactEmbeddingCodeGenerator,
    bucketConversion,
    getInsightToPropsConverter,
    insightConversion,
    chartAdditionalFactories,
    chartConfigPropMeta,
} from "../../../utils/embeddingCodeGenerator";
import { chartConfigFromInsight } from "../chartConfigFromInsight";

export class ComboChartDescriptor extends BigChartDescriptor implements IVisualizationDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableComboChart(params);
    }

    public getEmbeddingCode = getReactEmbeddingCodeGenerator({
        component: {
            importType: "named",
            name: "ComboChart",
            package: "@gooddata/sdk-ui-charts",
        },
        insightToProps: getInsightToPropsConverter<IComboChartProps>({
            primaryMeasures: bucketConversion(
                "primaryMeasures",
                "IMeasure[]",
                BucketNames.MEASURES,
                bucketMeasures,
            ),
            secondaryMeasures: bucketConversion(
                "secondaryMeasures",
                "IMeasure[]",
                BucketNames.SECONDARY_MEASURES,
                bucketMeasures,
            ),
            viewBy: bucketConversion("viewBy", "IAttribute[]", BucketNames.VIEW, bucketAttributes),
            filters: insightConversion("filters", "IFilter[]", insightFilters),
            sortBy: insightConversion("sortBy", "ISortItem[]", insightSorts),
            config: insightConversion("config", chartConfigPropMeta, chartConfigFromInsight),
        }),
        additionalFactories: chartAdditionalFactories,
    });
}
