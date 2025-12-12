// (C) 2021-2025 GoodData Corporation

import { type IInsight, type IInsightDefinition, type ISettings, insightSanitize } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { type IPivotTableProps } from "@gooddata/sdk-ui-pivot";

import { pivotTableAdditionalFactories } from "./pivotTableAdditionalFactories.js";
import { pivotTableConfigFromInsight } from "./pivotTableConfigFromInsight.js";
import { PluggablePivotTable } from "./PluggablePivotTable.js";
import { type IFluidLayoutDescriptor } from "../../../interfaces/LayoutDescriptor.js";
import { type IDrillDownContext } from "../../../interfaces/Visualization.js";
import {
    type IVisualizationDescriptor,
    type IVisualizationMeta,
    type IVisualizationSizeInfo,
    type PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor.js";
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
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor.js";
import { MIN_VISUALIZATION_HEIGHT_TABLE_REPEATER_FLEXIBLE_LAYOUT } from "../constants.js";
import {
    addIntersectionFiltersToInsight,
    modifyBucketsAttributesForDrillDown,
    sanitizeTableProperties,
} from "../drillDownUtil.js";

export class PivotTableDescriptor extends BaseChartDescriptor implements IVisualizationDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggablePivotTable(params);
    }

    public override getSizeInfo(
        _insight: IInsightDefinition,
        layoutDescriptor: IFluidLayoutDescriptor,
        settings: ISettings,
    ): IVisualizationSizeInfo {
        return {
            width: {
                default: 4,
                min: 2,
                max: layoutDescriptor.gridColumnsCount,
            },
            height: {
                default: this.getDefaultHeight(settings),
                min: this.getMinHeight(settings),
                max: this.getMaxHeight(settings),
            },
        };
    }

    protected override getMinHeight(_settings: ISettings): number {
        // Flexible layout is always enabled now
        return MIN_VISUALIZATION_HEIGHT_TABLE_REPEATER_FLEXIBLE_LAYOUT;
    }

    public override applyDrillDown(
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
            documentationUrl:
                "https://www.gooddata.com/docs/gooddata-ui/latest/references/visual_components/pivot_table",
            supportsExport: true,
            supportsZooming: false,
        };
    }
}
