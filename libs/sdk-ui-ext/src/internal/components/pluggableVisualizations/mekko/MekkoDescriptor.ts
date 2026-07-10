// (C) 2026 GoodData Corporation

import { BucketNames } from "@gooddata/sdk-ui";
import { type IMekkoProps } from "@gooddata/sdk-ui-charts";

import {
    type IVisualizationMeta,
    type PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor.js";
import { getReactEmbeddingCodeGenerator } from "../../../utils/embeddingCodeGenerator/getReactEmbeddingCodeGenerator.js";
import {
    executionConfigInsightConversion,
    filtersInsightConversion,
    localeInsightConversion,
    singleAttributeBucketConversion,
    singleMeasureBucketConversion,
    sortsInsightConversion,
} from "../../../utils/embeddingCodeGenerator/insightToPropsConverter/convenience.js";
import { getInsightToPropsConverter } from "../../../utils/embeddingCodeGenerator/insightToPropsConverter/convertor.js";
import { BigChartDescriptor } from "../BigChartDescriptor.js";
import { chartAdditionalFactories, chartConfigInsightConversion } from "../chartCodeGenUtils.js";

import { PluggableMekko } from "./PluggableMekko.js";

export class MekkoDescriptor extends BigChartDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableMekko(params);
    }

    public getEmbeddingCode = getReactEmbeddingCodeGenerator({
        component: {
            importType: "named",
            name: "Mekko",
            package: "@gooddata/sdk-ui-charts",
        },
        insightToProps: getInsightToPropsConverter<IMekkoProps>({
            widthMeasure: singleMeasureBucketConversion("widthMeasure", BucketNames.MEASURES),
            heightMeasure: singleMeasureBucketConversion("heightMeasure", BucketNames.SECONDARY_MEASURES),
            viewBy: singleAttributeBucketConversion("viewBy", BucketNames.VIEW),
            stackBy: singleAttributeBucketConversion("stackBy", BucketNames.STACK),
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
            supportsExport: true,
            supportsZooming: false,
        };
    }
}
