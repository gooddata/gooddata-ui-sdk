// (C) 2021-2022 GoodData Corporation
import { bucketIsEmpty, IInsight, insightBucket } from "@gooddata/sdk-model";
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
    IVisualizationMeta,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor";
import { PluggableColumnChart } from "./PluggableColumnChart";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor";
import { addIntersectionFiltersToInsight, modifyBucketsAttributesForDrillDown } from "../drillDownUtil";
import { drillDownFromAttributeLocalId } from "../../../utils/ImplicitDrillDownHelper";
import { IDrillDownContext, IDrillDownDefinition } from "../../../interfaces/Visualization";
import {
    filtersInsightConversion,
    getInsightToPropsConverter,
    getReactEmbeddingCodeGenerator,
    localeInsightConversion,
    multipleAttributesBucketConversion,
    multipleAttributesOrMeasuresBucketConversion,
    singleAttributeBucketConversion,
    sortsInsightConversion,
} from "../../../utils/embeddingCodeGenerator";
import { chartAdditionalFactories, chartConfigInsightConversion } from "../chartCodeGenUtils";

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
            measures: multipleAttributesOrMeasuresBucketConversion("measures", BucketNames.MEASURES),
            viewBy: multipleAttributesBucketConversion("viewBy", BucketNames.VIEW),
            stackBy: singleAttributeBucketConversion("stackBy", BucketNames.STACK),
            filters: filtersInsightConversion("filters"),
            sortBy: sortsInsightConversion("sortBy"),
            config: chartConfigInsightConversion("config"),
            locale: localeInsightConversion("locale"),
        }),
        additionalFactories: chartAdditionalFactories(),
    });

    public getMeta(): IVisualizationMeta {
        return {
            documentationUrl: "https://sdk.gooddata.com/gooddata-ui/docs/column_chart_component.html",
            supportsExport: true,
        };
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
