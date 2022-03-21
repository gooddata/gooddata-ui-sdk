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
import {
    bucketConversion,
    chartAdditionalFactories,
    chartConfigPropMeta,
    getInsightToPropsConverter,
    getReactEmbeddingCodeGenerator,
    insightConversion,
} from "../../../utils/embeddingCodeGenerator";
import { chartConfigFromInsight } from "../chartConfigFromInsight";

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
            primaryMeasure: bucketConversion(
                "primaryMeasure",
                "IMeasure",
                BucketNames.MEASURES,
                bucketMeasure,
            ),
            targetMeasure: bucketConversion(
                "targetMeasure",
                "IMeasure",
                BucketNames.SECONDARY_MEASURES,
                bucketMeasure,
            ),
            comparativeMeasure: bucketConversion(
                "comparativeMeasure",
                "IMeasure",
                BucketNames.TERTIARY_MEASURES,
                bucketMeasure,
            ),
            viewBy: bucketConversion("viewBy", "IAttribute[]", BucketNames.VIEW, bucketAttributes),
            filters: insightConversion("filters", "IFilter[]", insightFilters),
            sortBy: insightConversion("sortBy", "ISortItem[]", insightSorts),
            config: insightConversion("config", chartConfigPropMeta, chartConfigFromInsight),
        }),
        additionalFactories: chartAdditionalFactories,
    });

    private addFiltersForBullet(insight: IInsight, drillConfig: IDrillDownDefinition, event: IDrillEvent) {
        const clicked = drillDownFromAttributeLocalId(drillConfig);

        const cutIntersection = getIntersectionPartAfter(event.drillContext.intersection, clicked);
        return addIntersectionFiltersToInsight(insight, cutIntersection);
    }
}
