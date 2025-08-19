// (C) 2021-2025 GoodData Corporation
import { IInsight, IInsightDefinition, ISettings, insightSanitize } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { IPivotTableProps } from "@gooddata/sdk-ui-pivot";

import { pivotTableAdditionalFactories } from "./pivotTableAdditionalFactories.js";
import { pivotTableConfigFromInsight } from "./pivotTableConfigFromInsight.js";
import { PluggablePivotTable } from "./PluggablePivotTable.js";
import { IFluidLayoutDescriptor } from "../../../interfaces/LayoutDescriptor.js";
import { IDrillDownContext } from "../../../interfaces/Visualization.js";
import {
    IVisualizationDescriptor,
    IVisualizationMeta,
    IVisualizationSizeInfo,
    PluggableVisualizationFactory,
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
import {
    DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT,
    MIN_VISUALIZATION_HEIGHT,
    MIN_VISUALIZATION_HEIGHT_TABLE_REPEATER_FLEXIBLE_LAYOUT,
} from "../constants.js";
import {
    addIntersectionFiltersToInsight,
    modifyBucketsAttributesForDrillDown,
    sanitizeTableProperties,
} from "../drillDownUtil.js";

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
                default: settings.enableFlexibleDashboardLayout ? 4 : layoutDescriptor.gridColumnsCount,
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

    protected getMinHeight(settings: ISettings): number {
        const { enableKDWidgetCustomHeight, enableFlexibleDashboardLayout } = settings;
        if (!enableKDWidgetCustomHeight) {
            return DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT;
        }
        if (enableFlexibleDashboardLayout) {
            return MIN_VISUALIZATION_HEIGHT_TABLE_REPEATER_FLEXIBLE_LAYOUT;
        }
        return MIN_VISUALIZATION_HEIGHT;
    }

    public applyDrillDown(
        insight: IInsight,
        drillDownContext: IDrillDownContext,
        backendSupportsElementUris: boolean,
        enableDuplicatedLabelValuesInAttributeFilter: boolean,
    ): IInsight {
        const drillDownInsight = modifyBucketsAttributesForDrillDown(
            insight,
            drillDownContext.drillDefinition,
        );
        const drillDownInsightWithFilters = addIntersectionFiltersToInsight(
            drillDownInsight,
            drillDownContext.event.drillContext.intersection,
            backendSupportsElementUris,
            enableDuplicatedLabelValuesInAttributeFilter,
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
