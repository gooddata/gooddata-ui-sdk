// (C) 2021-2022 GoodData Corporation
import { IInsight } from "@gooddata/sdk-model";
import { BucketNames, IDrillEvent } from "@gooddata/sdk-ui";
import { ITreemapProps } from "@gooddata/sdk-ui-charts";

import {
    IVisualizationMeta,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor";
import { PluggableTreemap } from "./PluggableTreemap";
import { BigChartDescriptor } from "../BigChartDescriptor";
import {
    addIntersectionFiltersToInsight,
    modifyBucketsAttributesForDrillDown,
    reverseAndTrimIntersection,
} from "../drillDownUtil";
import { IDrillDownContext, IDrillDownDefinition } from "../../../interfaces/Visualization";
import {
    filtersInsightConversion,
    getInsightToPropsConverter,
    getReactEmbeddingCodeGenerator,
    localeInsightConversion,
    multipleAttributesOrMeasuresBucketConversion,
    singleAttributeBucketConversion,
} from "../../../utils/embeddingCodeGenerator";
import { chartAdditionalFactories, chartConfigInsightConversion } from "../chartCodeGenUtils";

export class TreemapDescriptor extends BigChartDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableTreemap(params);
    }

    public applyDrillDown(source: IInsight, drillDownContext: IDrillDownContext): IInsight {
        const withFilters = this.addFilters(source, drillDownContext.drillDefinition, drillDownContext.event);
        return modifyBucketsAttributesForDrillDown(withFilters, drillDownContext.drillDefinition);
    }

    public getEmbeddingCode = getReactEmbeddingCodeGenerator({
        component: {
            importType: "named",
            name: "Treemap",
            package: "@gooddata/sdk-ui-charts",
        },
        insightToProps: getInsightToPropsConverter<ITreemapProps>({
            measures: multipleAttributesOrMeasuresBucketConversion("measures", BucketNames.MEASURES),
            viewBy: singleAttributeBucketConversion("viewBy", BucketNames.VIEW),
            segmentBy: singleAttributeBucketConversion("segmentBy", BucketNames.SEGMENT),
            filters: filtersInsightConversion("filters"),
            config: chartConfigInsightConversion("config"),
            locale: localeInsightConversion("locale"),
        }),
        additionalFactories: chartAdditionalFactories(),
    });

    public getMeta(): IVisualizationMeta {
        return {
            documentationUrl: "https://sdk.gooddata.com/gooddata-ui/docs/treemap_component.html",
            supportsExport: true,
        };
    }

    private addFilters(source: IInsight, drillConfig: IDrillDownDefinition, event: IDrillEvent) {
        const cutIntersection = reverseAndTrimIntersection(drillConfig, event.drillContext.intersection);
        return addIntersectionFiltersToInsight(source, cutIntersection);
    }
}
