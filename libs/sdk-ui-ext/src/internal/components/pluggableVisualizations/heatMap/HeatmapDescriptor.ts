// (C) 2021-2025 GoodData Corporation

import { IInsight } from "@gooddata/sdk-model";
import { BucketNames, IDrillEvent, isDrillIntersectionAttributeItem } from "@gooddata/sdk-ui";
import { IHeatmapProps } from "@gooddata/sdk-ui-charts";

import { PluggableHeatmap } from "./PluggableHeatmap.js";
import { IDrillDownContext, IDrillDownDefinition } from "../../../interfaces/Visualization.js";
import {
    IVisualizationDescriptor,
    IVisualizationMeta,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor.js";
import {
    executionConfigInsightConversion,
    filtersInsightConversion,
    getInsightToPropsConverter,
    getReactEmbeddingCodeGenerator,
    localeInsightConversion,
    singleAttributeBucketConversion,
    singleAttributeOrMeasureBucketConversion,
    sortsInsightConversion,
} from "../../../utils/embeddingCodeGenerator/index.js";
import { drillDownFromAttributeLocalId } from "../../../utils/ImplicitDrillDownHelper.js";
import { BigChartDescriptor } from "../BigChartDescriptor.js";
import { chartAdditionalFactories, chartConfigInsightConversion } from "../chartCodeGenUtils.js";
import { addIntersectionFiltersToInsight, modifyBucketsAttributesForDrillDown } from "../drillDownUtil.js";

export class HeatmapDescriptor extends BigChartDescriptor implements IVisualizationDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableHeatmap(params);
    }

    public override applyDrillDown(
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
            documentationUrl:
                "https://www.gooddata.com/docs/gooddata-ui/latest/references/visual_components/heatmap",
            supportsExport: true,
            supportsZooming: true,
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
