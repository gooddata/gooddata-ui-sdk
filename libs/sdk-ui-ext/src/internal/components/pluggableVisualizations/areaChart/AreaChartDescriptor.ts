// (C) 2021-2022 GoodData Corporation
import { BucketNames, IDrillEvent } from "@gooddata/sdk-ui";
import {
    IVisualizationDescriptor,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor";
import { PluggableAreaChart } from "./PluggableAreaChart";
import { BigChartDescriptor } from "../BigChartDescriptor";
import {
    bucketAttribute,
    bucketAttributes,
    bucketMeasures,
    IInsight,
    insightBucket,
    insightFilters,
    insightSorts,
} from "@gooddata/sdk-model";
import {
    modifyBucketsAttributesForDrillDown,
    reverseAndTrimIntersection,
    addIntersectionFiltersToInsight,
} from "../drillDownUtil";
import { IDrillDownContext, IDrillDownDefinition } from "../../../interfaces/Visualization";
import { getReactEmbeddingCodeGenerator } from "../../../utils/embeddingCodeGenerator";
import { IAreaChartBucketProps } from "@gooddata/sdk-ui-charts";

export class AreaChartDescriptor extends BigChartDescriptor implements IVisualizationDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableAreaChart(params);
    }

    public applyDrillDown(insight: IInsight, drillDownContext: IDrillDownContext): IInsight {
        const withFilters = this.addFilters(
            insight,
            drillDownContext.drillDefinition,
            drillDownContext.event,
        );
        return modifyBucketsAttributesForDrillDown(withFilters, drillDownContext.drillDefinition);
    }

    public getEmbeddingCode = getReactEmbeddingCodeGenerator({
        component: {
            importType: "named",
            name: "AreaChart",
            package: "@gooddata/sdk-ui-charts",
        },
        insightToProps(insight): IAreaChartBucketProps {
            const measuresBucket = insightBucket(insight, BucketNames.MEASURES);
            const viewBucket = insightBucket(insight, BucketNames.VIEW);
            const stackBucket = insightBucket(insight, BucketNames.STACK);

            const measures = measuresBucket && bucketMeasures(measuresBucket);
            const viewBy = viewBucket && bucketAttributes(viewBucket);
            const stackBy = stackBucket && bucketAttribute(stackBucket);
            const filters = insightFilters(insight);
            const sortBy = insightSorts(insight);

            return {
                measures,
                viewBy,
                stackBy,
                filters,
                sortBy,
            };
        },
    });

    private addFilters(source: IInsight, drillConfig: IDrillDownDefinition, event: IDrillEvent) {
        const cutIntersection = reverseAndTrimIntersection(drillConfig, event.drillContext.intersection);
        return addIntersectionFiltersToInsight(source, cutIntersection);
    }
}
