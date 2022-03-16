// (C) 2021-2022 GoodData Corporation
import {
    bucketAttribute,
    bucketAttributes,
    bucketIsEmpty,
    bucketMeasures,
    IInsight,
    insightBucket,
    insightFilters,
    insightSorts,
} from "@gooddata/sdk-model";
import {
    BucketNames,
    getIntersectionPartAfter,
    IDrillEvent,
    IDrillEventIntersectionElement,
} from "@gooddata/sdk-ui";
import { arrayUtils } from "@gooddata/util";
import { IColumnChartProps } from "@gooddata/sdk-ui-charts";

import {
    IVisualizationDescriptor,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor";
import { PluggableColumnChart } from "./PluggableColumnChart";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor";
import { addIntersectionFiltersToInsight, modifyBucketsAttributesForDrillDown } from "../drillDownUtil";
import { drillDownFromAttributeLocalId } from "../../../utils/ImplicitDrillDownHelper";
import { IDrillDownContext, IDrillDownDefinition } from "../../../interfaces/Visualization";
import {
    bucketConversion,
    chartConfigFromInsight,
    getInsightToPropsConverter,
    getReactEmbeddingCodeGenerator,
    insightConversion,
} from "../../../utils/embeddingCodeGenerator";

export class ColumnChartDescriptor extends BaseChartDescriptor implements IVisualizationDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableColumnChart(params);
    }

    public applyDrillDown(insight: IInsight, drillDownContext: IDrillDownContext): IInsight {
        const withFilters = this.addFiltersForColumnBar(
            insight,
            drillDownContext.drillDefinition,
            drillDownContext.event,
        );
        return modifyBucketsAttributesForDrillDown(withFilters, drillDownContext.drillDefinition);
    }

    public getEmbeddingCode = getReactEmbeddingCodeGenerator({
        component: {
            importType: "named",
            name: "ColumnChart",
            package: "@gooddata/sdk-ui-charts",
        },
        insightToProps: getInsightToPropsConverter<IColumnChartProps>({
            measures: bucketConversion("measures", BucketNames.MEASURES, bucketMeasures),
            viewBy: bucketConversion("viewBy", BucketNames.VIEW, bucketAttributes),
            stackBy: bucketConversion("stackBy", BucketNames.STACK, bucketAttribute),
            filters: insightConversion("filters", insightFilters),
            sortBy: insightConversion("sortBy", insightSorts),
            config: insightConversion("config", chartConfigFromInsight),
        }),
    });

    private adjustIntersectionForColumnBar(
        insight: IInsight,
        event: IDrillEvent,
    ): IDrillEventIntersectionElement[] {
        const stackBucket = insightBucket(insight, BucketNames.STACK);
        const hasStackByAttributes = stackBucket && !bucketIsEmpty(stackBucket);

        const intersection = event.drillContext.intersection;
        return hasStackByAttributes ? arrayUtils.shiftArrayRight(intersection) : intersection;
    }

    private addFiltersForColumnBar(insight: IInsight, drillConfig: IDrillDownDefinition, event: IDrillEvent) {
        const clicked = drillDownFromAttributeLocalId(drillConfig);

        const reorderedIntersection = this.adjustIntersectionForColumnBar(insight, event);
        const cutIntersection = getIntersectionPartAfter(reorderedIntersection, clicked);
        return addIntersectionFiltersToInsight(insight, cutIntersection);
    }
}
