// (C) 2021-2026 GoodData Corporation

import { type IInsight } from "@gooddata/sdk-model";
import { BucketNames, type IDrillEvent } from "@gooddata/sdk-ui";
import { type ILineChartProps } from "@gooddata/sdk-ui-charts";

import { PluggableLineChart } from "./PluggableLineChart.js";
import { type IDrillDownContext, type IDrillDownDefinition } from "../../../interfaces/Visualization.js";
import {
    type IVisualizationDescriptor,
    type IVisualizationMeta,
    type PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor.js";
import { getReactEmbeddingCodeGenerator } from "../../../utils/embeddingCodeGenerator/getReactEmbeddingCodeGenerator.js";
import {
    executionConfigInsightConversion,
    filtersInsightConversion,
    localeInsightConversion,
    multipleAttributesOrMeasuresBucketConversion,
    singleAttributeBucketConversion,
    sortsInsightConversion,
} from "../../../utils/embeddingCodeGenerator/insightToPropsConverter/convenience.js";
import { getInsightToPropsConverter } from "../../../utils/embeddingCodeGenerator/insightToPropsConverter/convertor.js";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor.js";
import {
    chartAdditionalFactories,
    chartConfigInsightConversion,
    chartForecastConfigInsightConversion,
} from "../chartCodeGenUtils.js";
import {
    addIntersectionFiltersToInsight,
    modifyBucketsAttributesForDrillDown,
    reverseAndTrimIntersection,
} from "../drillDownUtil.js";

export class LineChartDescriptor extends BaseChartDescriptor implements IVisualizationDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableLineChart(params);
    }

    public override applyDrillDown(
        source: IInsight,
        drillDownContext: IDrillDownContext,
        backendSupportsElementUris: boolean,
    ): IInsight {
        const withFilters = this.addFilters(
            source,
            drillDownContext.drillDefinition,
            drillDownContext.event,
            backendSupportsElementUris,
        );
        return modifyBucketsAttributesForDrillDown(withFilters, drillDownContext.drillDefinition);
    }

    public getEmbeddingCode = getReactEmbeddingCodeGenerator({
        component: {
            importType: "named",
            name: "LineChart",
            package: "@gooddata/sdk-ui-charts",
        },
        insightToProps: getInsightToPropsConverter<ILineChartProps>({
            measures: multipleAttributesOrMeasuresBucketConversion("measures", BucketNames.MEASURES),
            trendBy: singleAttributeBucketConversion("trendBy", BucketNames.TREND),
            segmentBy: singleAttributeBucketConversion("segmentBy", BucketNames.SEGMENT),
            filters: filtersInsightConversion("filters"),
            sortBy: sortsInsightConversion("sortBy"),
            config: chartConfigInsightConversion("config"),
            forecastConfig: chartForecastConfigInsightConversion("forecastConfig"),
            locale: localeInsightConversion("locale"),
            execConfig: executionConfigInsightConversion("execConfig"),
        }),
        additionalFactories: chartAdditionalFactories(),
    });

    public getMeta(): IVisualizationMeta {
        return {
            documentationUrl:
                "https://www.gooddata.com/docs/gooddata-ui/latest/references/visual_components/line_chart",
            supportsExport: true,
            supportsZooming: true,
        };
    }

    private addFilters(
        source: IInsight,
        drillConfig: IDrillDownDefinition,
        event: IDrillEvent,
        backendSupportsElementUris: boolean,
    ) {
        const cutIntersection = reverseAndTrimIntersection(drillConfig, event.drillContext.intersection);
        return addIntersectionFiltersToInsight(source, cutIntersection, backendSupportsElementUris);
    }
}
