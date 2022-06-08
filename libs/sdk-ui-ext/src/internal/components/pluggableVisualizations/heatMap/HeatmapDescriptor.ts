// (C) 2021-2022 GoodData Corporation
import { IInsight } from "@gooddata/sdk-model";
import { BucketNames, IDrillEvent, isDrillIntersectionAttributeItem } from "@gooddata/sdk-ui";
import { IHeatmapProps } from "@gooddata/sdk-ui-charts";

import {
    IVisualizationDescriptor,
    IVisualizationMeta,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor";
import { PluggableHeatmap } from "./PluggableHeatmap";
import { BigChartDescriptor } from "../BigChartDescriptor";
import { IDrillDownContext, IDrillDownDefinition } from "../../../interfaces/Visualization";
import { drillDownFromAttributeLocalId } from "../../../utils/ImplicitDrillDownHelper";
import { addIntersectionFiltersToInsight, modifyBucketsAttributesForDrillDown } from "../drillDownUtil";
import {
    executionConfigInsightConversion,
    filtersInsightConversion,
    getInsightToPropsConverter,
    getReactEmbeddingCodeGenerator,
    localeInsightConversion,
    singleAttributeBucketConversion,
    singleAttributeOrMeasureBucketConversion,
    sortsInsightConversion,
} from "../../../utils/embeddingCodeGenerator";
import { chartAdditionalFactories, chartConfigInsightConversion } from "../chartCodeGenUtils";

export class HeatmapDescriptor extends BigChartDescriptor implements IVisualizationDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableHeatmap(params);
    }

    public applyDrillDown(
        insight: IInsight,
        drillDownContext: IDrillDownContext,
        backendSupportsElementUris: boolean,
    ): IInsight {
        const withFilters = this.addFilters(
            insight,
            drillDownContext.drillDefinition,
            drillDownContext.event,
            backendSupportsElementUris,
        );
        return modifyBucketsAttributesForDrillDown(withFilters, drillDownContext.drillDefinition);
    }

    public getEmbeddingCode = getReactEmbeddingCodeGenerator({
        component: {
            importType: "named",
            name: "Heatmap",
            package: "@gooddata/sdk-ui-charts",
        },
        insightToProps: getInsightToPropsConverter<IHeatmapProps>({
            measure: singleAttributeOrMeasureBucketConversion("measure", BucketNames.MEASURES),
            rows: singleAttributeBucketConversion("rows", BucketNames.VIEW),
            columns: singleAttributeBucketConversion("columns", BucketNames.STACK),
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
            documentationUrl: "https://sdk.gooddata.com/gooddata-ui/docs/heatmap_component.html",
            supportsExport: true,
        };
    }

    private addFilters(
        source: IInsight,
        drillConfig: IDrillDownDefinition,
        event: IDrillEvent,
        backendSupportsElementUris: boolean,
    ) {
        const clicked = drillDownFromAttributeLocalId(drillConfig);
        const cutIntersection = (event.drillContext.intersection || []).filter(
            (i) =>
                isDrillIntersectionAttributeItem(i.header) &&
                i.header.attributeHeader.localIdentifier === clicked,
        );
        return addIntersectionFiltersToInsight(source, cutIntersection, backendSupportsElementUris);
    }
}
