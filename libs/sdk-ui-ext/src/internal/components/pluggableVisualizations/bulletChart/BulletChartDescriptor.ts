// (C) 2021-2022 GoodData Corporation
import { IInsight } from "@gooddata/sdk-model";
import { BucketNames, getIntersectionPartAfter, IDrillEvent } from "@gooddata/sdk-ui";
import { IBulletChartProps } from "@gooddata/sdk-ui-charts";

import {
    IVisualizationDescriptor,
    IVisualizationMeta,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor";
import { PluggableBulletChart } from "./PluggableBulletChart";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor";
import { modifyBucketsAttributesForDrillDown, addIntersectionFiltersToInsight } from "../drillDownUtil";
import { IDrillDownContext, IDrillDownDefinition } from "../../../interfaces/Visualization";
import { drillDownFromAttributeLocalId } from "../../../utils/ImplicitDrillDownHelper";
import {
    filtersInsightConversion,
    getInsightToPropsConverter,
    getReactEmbeddingCodeGenerator,
    localeInsightConversion,
    multipleAttributesBucketConversion,
    singleAttributeOrMeasureBucketConversion,
    sortsInsightConversion,
} from "../../../utils/embeddingCodeGenerator";
import { chartAdditionalFactories, chartConfigInsightConversion } from "../chartCodeGenUtils";

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
            primaryMeasure: singleAttributeOrMeasureBucketConversion("primaryMeasure", BucketNames.MEASURES),
            targetMeasure: singleAttributeOrMeasureBucketConversion(
                "targetMeasure",
                BucketNames.SECONDARY_MEASURES,
            ),
            comparativeMeasure: singleAttributeOrMeasureBucketConversion(
                "comparativeMeasure",
                BucketNames.TERTIARY_MEASURES,
            ),
            viewBy: multipleAttributesBucketConversion("viewBy", BucketNames.VIEW),
            filters: filtersInsightConversion("filters"),
            sortBy: sortsInsightConversion("sortBy"),
            config: chartConfigInsightConversion("config"),
            locale: localeInsightConversion("locale"),
        }),
        additionalFactories: chartAdditionalFactories(),
    });

    public getMeta(): IVisualizationMeta {
        return {
            documentationUrl: "https://sdk.gooddata.com/gooddata-ui/docs/bullet_chart_component.html",
            supportsExport: true,
        };
    }

    private addFiltersForBullet(insight: IInsight, drillConfig: IDrillDownDefinition, event: IDrillEvent) {
        const clicked = drillDownFromAttributeLocalId(drillConfig);

        const cutIntersection = getIntersectionPartAfter(event.drillContext.intersection, clicked);
        return addIntersectionFiltersToInsight(insight, cutIntersection);
    }
}
