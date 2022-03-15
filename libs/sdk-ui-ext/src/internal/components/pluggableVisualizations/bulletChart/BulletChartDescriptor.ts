// (C) 2021-2022 GoodData Corporation
import { bucketAttributes, bucketMeasure, IInsight, insightFilters, insightSorts } from "@gooddata/sdk-model";
import { BucketNames, getIntersectionPartAfter, IDrillEvent } from "@gooddata/sdk-ui";
import { IBulletChartProps } from "@gooddata/sdk-ui-charts";

import {
    IVisualizationDescriptor,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor";
import { PluggableBulletChart } from "./PluggableBulletChart";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor";
import { modifyBucketsAttributesForDrillDown, addIntersectionFiltersToInsight } from "../drillDownUtil";
import { IDrillDownContext, IDrillDownDefinition } from "../../../interfaces/Visualization";
import { drillDownFromAttributeLocalId } from "../../../utils/ImplicitDrillDownHelper";
import { getReactEmbeddingCodeGenerator } from "../../../utils/embeddingCodeGenerator";
import {
    bucketConversion,
    chartConfigFromInsight,
    getInsightToPropsConverter,
    insightConversion,
} from "../../../utils/embeddingCodeGenerator/insightToPropsConverter";

export class BulletChartDescriptor extends BaseChartDescriptor implements IVisualizationDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableBulletChart(params);
    }

    public applyDrillDown(insight: IInsight, drillDownContext: IDrillDownContext): IInsight {
        const withFilters = this.addFiltersForBullet(
            insight,
            drillDownContext.drillDefinition,
            drillDownContext.event,
        );
        return modifyBucketsAttributesForDrillDown(withFilters, drillDownContext.drillDefinition);
    }

    public getEmbeddingCode = getReactEmbeddingCodeGenerator({
        component: {
            importType: "named",
            name: "BulletChart",
            package: "@gooddata/sdk-ui-charts",
        },
        insightToProps: getInsightToPropsConverter<IBulletChartProps>({
            primaryMeasure: bucketConversion("primaryMeasure", BucketNames.MEASURES, bucketMeasure),
            targetMeasure: bucketConversion("targetMeasure", BucketNames.SECONDARY_MEASURES, bucketMeasure),
            comparativeMeasure: bucketConversion(
                "comparativeMeasure",
                BucketNames.TERTIARY_MEASURES,
                bucketMeasure,
            ),
            viewBy: bucketConversion("viewBy", BucketNames.VIEW, bucketAttributes),
            filters: insightConversion("filters", insightFilters),
            sortBy: insightConversion("sortBy", insightSorts),
            config: insightConversion("config", chartConfigFromInsight),
        }),
    });

    private addFiltersForBullet(insight: IInsight, drillConfig: IDrillDownDefinition, event: IDrillEvent) {
        const clicked = drillDownFromAttributeLocalId(drillConfig);

        const cutIntersection = getIntersectionPartAfter(event.drillContext.intersection, clicked);
        return addIntersectionFiltersToInsight(insight, cutIntersection);
    }
}
