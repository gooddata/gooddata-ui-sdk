// (C) 2021-2022 GoodData Corporation

import {
    IVisualizationDescriptor,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor";
import { PluggableLineChart } from "./PluggableLineChart";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor";
import { bucketAttribute, bucketMeasures, IInsight, insightFilters, insightSorts } from "@gooddata/sdk-model";
import { BucketNames, IDrillEvent } from "@gooddata/sdk-ui";
import { IDrillDownContext, IDrillDownDefinition } from "../../../interfaces/Visualization";
import {
    addIntersectionFiltersToInsight,
    modifyBucketsAttributesForDrillDown,
    reverseAndTrimIntersection,
} from "../drillDownUtil";
import { getReactEmbeddingCodeGenerator } from "../../../utils/embeddingCodeGenerator";
import { ILineChartBucketProps } from "@gooddata/sdk-ui-charts";
import {
    bucketConversion,
    getInsightToPropsConverter,
    insightConversion,
} from "../../../utils/embeddingCodeGenerator/insightToPropsConverter";

export class LineChartDescriptor extends BaseChartDescriptor implements IVisualizationDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableLineChart(params);
    }

    public applyDrillDown(source: IInsight, drillDownContext: IDrillDownContext): IInsight {
        const withFilters = this.addFilters(source, drillDownContext.drillDefinition, drillDownContext.event);
        return modifyBucketsAttributesForDrillDown(withFilters, drillDownContext.drillDefinition);
    }

    public getEmbeddingCode = getReactEmbeddingCodeGenerator({
        component: {
            importType: "named",
            name: "LineChart",
            package: "@gooddata/sdk-ui-charts",
        },
        insightToProps: getInsightToPropsConverter<ILineChartBucketProps>({
            measures: bucketConversion("measures", BucketNames.MEASURES, bucketMeasures),
            trendBy: bucketConversion("trendBy", BucketNames.TREND, bucketAttribute),
            segmentBy: bucketConversion("segmentBy", BucketNames.SEGMENT, bucketAttribute),
            filters: insightConversion("filters", insightFilters),
            sortBy: insightConversion("sortBy", insightSorts),
        }),
    });

    private addFilters(source: IInsight, drillConfig: IDrillDownDefinition, event: IDrillEvent) {
        const cutIntersection = reverseAndTrimIntersection(drillConfig, event.drillContext.intersection);
        return addIntersectionFiltersToInsight(source, cutIntersection);
    }
}
