// (C) 2021-2022 GoodData Corporation
import {
    IVisualizationDescriptor,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor";
import { PluggableComboChart } from "./PluggableComboChart";
import { BigChartDescriptor } from "../BigChartDescriptor";
import { getReactEmbeddingCodeGenerator } from "../../../utils/embeddingCodeGenerator";
import {
    bucketConversion,
    chartConfigFromInsight,
    getInsightToPropsConverter,
    insightConversion,
} from "../../../utils/embeddingCodeGenerator/insightToPropsConverter";
import { IComboChartProps } from "@gooddata/sdk-ui-charts";
import { BucketNames } from "@gooddata/sdk-ui";
import { bucketMeasures, bucketAttributes, insightFilters, insightSorts } from "@gooddata/sdk-model";

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
            primaryMeasures: bucketConversion("primaryMeasures", BucketNames.MEASURES, bucketMeasures),
            secondaryMeasures: bucketConversion(
                "secondaryMeasures",
                BucketNames.SECONDARY_MEASURES,
                bucketMeasures,
            ),
            viewBy: bucketConversion("viewBy", BucketNames.VIEW, bucketAttributes),
            filters: insightConversion("filters", insightFilters),
            sortBy: insightConversion("sortBy", insightSorts),
            config: insightConversion("config", chartConfigFromInsight),
        }),
    });
}
