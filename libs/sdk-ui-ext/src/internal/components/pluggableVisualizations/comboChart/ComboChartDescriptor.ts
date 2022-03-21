// (C) 2021-2022 GoodData Corporation
import { IComboChartProps } from "@gooddata/sdk-ui-charts";
import { BucketNames } from "@gooddata/sdk-ui";

import {
    IVisualizationDescriptor,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor";
import { PluggableComboChart } from "./PluggableComboChart";
import { BigChartDescriptor } from "../BigChartDescriptor";
import {
    getReactEmbeddingCodeGenerator,
    getInsightToPropsConverter,
    chartAdditionalFactories,
    filtersInsightConversion,
    sortsInsightConversion,
    chartConfigInsightConversion,
    multipleMeasuresBucketConversion,
    multipleAttributesBucketConversion,
} from "../../../utils/embeddingCodeGenerator";

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
            primaryMeasures: multipleMeasuresBucketConversion("primaryMeasures", BucketNames.MEASURES),
            secondaryMeasures: multipleMeasuresBucketConversion(
                "secondaryMeasures",
                BucketNames.SECONDARY_MEASURES,
            ),
            viewBy: multipleAttributesBucketConversion("viewBy", BucketNames.VIEW),
            filters: filtersInsightConversion("filters"),
            sortBy: sortsInsightConversion("sortBy"),
            config: chartConfigInsightConversion("config"),
        }),
        additionalFactories: chartAdditionalFactories,
    });
}
