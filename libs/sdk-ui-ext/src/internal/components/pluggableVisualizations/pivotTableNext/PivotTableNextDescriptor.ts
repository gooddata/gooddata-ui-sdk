// (C) 2025 GoodData Corporation

import { IInsight, IInsightDefinition, ISettings, insightSanitize } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { IPivotTableNextProps } from "@gooddata/sdk-ui-pivot/next";

import { pivotTableNextAdditionalFactories } from "./pivotTableNextAdditionalFactories.js";
import { pivotTableNextConfigFromInsight } from "./pivotTableNextConfigFromInsight.js";
import { PluggablePivotTableNext } from "./PluggablePivotTableNext.js";
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
    MIN_VISUALIZATION_HEIGHT_FLEXIBLE_LAYOUT,
} from "../constants.js";
import {
    addIntersectionFiltersToInsight,
    modifyBucketsAttributesForDrillDown,
    sanitizeTableProperties,
} from "../drillDownUtil.js";

export class PivotTableNextDescriptor extends BaseChartDescriptor implements IVisualizationDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggablePivotTableNext(params);
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

    protected override getMinHeight(settings: ISettings): number {
        const { enableKDWidgetCustomHeight } = settings;
        if (!enableKDWidgetCustomHeight) {
            return DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT;
        }
        // Flexible layout is always enabled now
        return MIN_VISUALIZATION_HEIGHT_FLEXIBLE_LAYOUT;
    }

    public override applyDrillDown(
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
            name: "PivotTableNext",
            package: "@gooddata/sdk-ui-pivot/next",
        },
        insightToProps: getInsightToPropsConverter<IPivotTableNextProps>({
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
                        name: "PivotTableNextConfig",
                        package: "@gooddata/sdk-ui-pivot/next",
                    },
                    cardinality: "scalar",
                },
                pivotTableNextConfigFromInsight,
            ),
            locale: localeInsightConversion("locale"),
            execConfig: executionConfigInsightConversion("execConfig"),
        }),
        additionalFactories: pivotTableNextAdditionalFactories,
    });

    public getMeta(): IVisualizationMeta {
        return {
            documentationUrl:
                "https://www.gooddata.com/docs/cloud/experimental-features/enhanced-pivot-table/",
            supportsExport: true,
            supportsZooming: false,
        };
    }
}
