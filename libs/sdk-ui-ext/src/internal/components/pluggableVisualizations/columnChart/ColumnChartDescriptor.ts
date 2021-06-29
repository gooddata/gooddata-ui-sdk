// (C) 2021 GoodData Corporation

import { PluggableVisualizationFactory } from "../../../interfaces/VisualizationDescriptor";
import { PluggableColumnChart } from "./PluggableColumnChart";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor";
import { bucketIsEmpty, IInsight, insightBucket } from "@gooddata/sdk-model";
import { addIntersectionFiltersToInsight, modifyBucketsAttributesForDrillDown } from "../drillDownUtil";
import {
    BucketNames,
    getIntersectionPartAfter,
    IDrillEvent,
    IDrillEventIntersectionElement,
} from "@gooddata/sdk-ui";
import { arrayUtils } from "@gooddata/util";
import { drillDownFromAttributeLocalId } from "../../../utils/ImplicitDrillDownHelper";
import { IDrillDownContext, IDrillDownDefinition } from "../../../interfaces/Visualization";
export class ColumnChartDescriptor extends BaseChartDescriptor {
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
