// (C) 2021-2026 GoodData Corporation

import { type IInsight, bucketIsEmpty, insightBucket } from "@gooddata/sdk-model";
import {
    BucketNames,
    type IDrillEvent,
    type IDrillEventIntersectionElement,
    getIntersectionPartAfter,
} from "@gooddata/sdk-ui";
import { type IBarChartProps } from "@gooddata/sdk-ui-charts";
import { shiftArrayRight } from "@gooddata/util";

import { PluggableBarChart } from "./PluggableBarChart.js";
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
    multipleAttributesBucketConversion,
    multipleAttributesOrMeasuresBucketConversion,
    singleAttributeBucketConversion,
    sortsInsightConversion,
} from "../../../utils/embeddingCodeGenerator/insightToPropsConverter/convenience.js";
import { getInsightToPropsConverter } from "../../../utils/embeddingCodeGenerator/insightToPropsConverter/convertor.js";
import { drillDownFromAttributeLocalId } from "../../../utils/ImplicitDrillDownHelper.js";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor.js";
import { chartAdditionalFactories, chartConfigInsightConversion } from "../chartCodeGenUtils.js";
import { addIntersectionFiltersToInsight, modifyBucketsAttributesForDrillDown } from "../drillDownUtil.js";

export class BarChartDescriptor extends BaseChartDescriptor implements IVisualizationDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableBarChart(params);
    }

    public override applyDrillDown(
        source: IInsight,
        drillDownContext: IDrillDownContext,
        backendSupportsElementUris: boolean,
    ): IInsight {
        const withFilters = this.addFiltersForColumnBar(
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
            name: "BarChart",
            package: "@gooddata/sdk-ui-charts",
        },
        insightToProps: getInsightToPropsConverter<IBarChartProps>({
            measures: multipleAttributesOrMeasuresBucketConversion("measures", BucketNames.MEASURES),
            viewBy: multipleAttributesBucketConversion("viewBy", BucketNames.VIEW),
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
            documentationUrl:
                "https://www.gooddata.com/docs/gooddata-ui/latest/references/visual_components/bar_chart",
            supportsExport: true,
            supportsZooming: true,
        };
    }

    private adjustIntersectionForColumnBar(
        source: IInsight,
        event: IDrillEvent,
    ): IDrillEventIntersectionElement[] {
        const stackBucket = insightBucket(source, BucketNames.STACK);
        const hasStackByAttributes = stackBucket && !bucketIsEmpty(stackBucket);

        const intersection = event.drillContext.intersection ?? [];
        return hasStackByAttributes ? shiftArrayRight(intersection) : intersection;
    }

    private addFiltersForColumnBar(
        source: IInsight,
        drillConfig: IDrillDownDefinition,
        event: IDrillEvent,
        backendSupportsElementUris: boolean,
    ) {
        const clicked = drillDownFromAttributeLocalId(drillConfig);

        const reorderedIntersection = this.adjustIntersectionForColumnBar(source, event);
        const cutIntersection = getIntersectionPartAfter(reorderedIntersection, clicked);
        return addIntersectionFiltersToInsight(source, cutIntersection, backendSupportsElementUris);
    }
}
