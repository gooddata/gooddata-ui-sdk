// (C) 2021-2022 GoodData Corporation
import { IInsight, IInsightDefinition, insightSanitize, ISettings } from "@gooddata/sdk-model";
import { IPivotTableProps } from "@gooddata/sdk-ui-pivot";
import { BucketNames } from "@gooddata/sdk-ui";

import {
    IVisualizationDescriptor,
    IVisualizationMeta,
    IVisualizationSizeInfo,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor.js";
import { IFluidLayoutDescriptor } from "../../../interfaces/LayoutDescriptor.js";
import { PluggablePivotTable } from "./PluggablePivotTable.js";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor.js";
import { IDrillDownContext } from "../../../interfaces/Visualization.js";
import {
    addIntersectionFiltersToInsight,
    modifyBucketsAttributesForDrillDown,
    sanitizeTableProperties,
} from "../drillDownUtil.js";
import {
    executionConfigInsightConversion,
    filtersInsightConversion,
    getInsightToPropsConverter,
    getReactEmbeddingCodeGenerator,
    insightConversion,
    localeInsightConversion,
    multipleAttributesBucketConversion,
    multipleAttributesOrMeasuresBucketConversion,
    sortsInsightConversion,
    totalsInsightConversion,
} from "../../../utils/embeddingCodeGenerator/index.js";
import { pivotTableConfigFromInsight } from "./pivotTableConfigFromInsight.js";
import { pivotTableAdditionalFactories } from "./pivotTableAdditionalFactories.js";

export class PivotTableDescriptor extends BaseChartDescriptor implements IVisualizationDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggablePivotTable(params);
    }

    public getSizeInfo(
        _insight: IInsightDefinition,
        layoutDescriptor: IFluidLayoutDescriptor,
        settings: ISettings,
    ): IVisualizationSizeInfo {
        return {
            width: {
                default: layoutDescriptor.gridColumnsCount,
                min: 3,
                max: layoutDescriptor.gridColumnsCount,
            },
            height: {
                default: this.getDefaultHeight(settings.enableKDWidgetCustomHeight),
                min: this.getMinHeight(settings.enableKDWidgetCustomHeight),
                max: this.getMaxHeight(settings.enableKDWidgetCustomHeight),
            },
        };
    }

    public applyDrillDown(
        insight: IInsight,
        drillDownContext: IDrillDownContext,
        backendSupportsElementUris: boolean,
    ): IInsight {
        const drillDownInsight = modifyBucketsAttributesForDrillDown(
            insight,
            drillDownContext.drillDefinition,
        );
        const drillDownInsightWithFilters = addIntersectionFiltersToInsight(
            drillDownInsight,
            drillDownContext.event.drillContext.intersection,
            backendSupportsElementUris,
        );
        return sanitizeTableProperties(insightSanitize(drillDownInsightWithFilters));
    }

    public getEmbeddingCode = getReactEmbeddingCodeGenerator({
        component: {
            importType: "named",
            name: "PivotTable",
            package: "@gooddata/sdk-ui-pivot",
        },
        insightToProps: getInsightToPropsConverter<IPivotTableProps>({
            measures: multipleAttributesOrMeasuresBucketConversion("measures", BucketNames.MEASURES),
            rows: multipleAttributesBucketConversion("rows", BucketNames.ATTRIBUTE),
            columns: multipleAttributesBucketConversion("columns", BucketNames.COLUMNS),
            filters: filtersInsightConversion("filters"),
            sortBy: sortsInsightConversion("sortBy"),
            totals: totalsInsightConversion("totals"),
            config: insightConversion(
                "config",
                {
                    typeImport: {
                        importType: "named",
                        name: "IPivotTableConfig",
                        package: "@gooddata/sdk-ui-pivot",
                    },
                    cardinality: "scalar",
                },
                pivotTableConfigFromInsight,
            ),
            locale: localeInsightConversion("locale"),
            execConfig: executionConfigInsightConversion("execConfig"),
        }),
        additionalFactories: pivotTableAdditionalFactories,
    });

    public getMeta(): IVisualizationMeta {
        return {
            documentationUrl: "https://sdk.gooddata.com/gooddata-ui/docs/pivot_table_component.html",
            supportsExport: true,
            supportsZooming: false,
        };
    }
}
