// (C) 2025 GoodData Corporation

import {
    IInsight,
    IInsightDefinition,
    ISettings,
    insightProperties,
    insightSanitize,
} from "@gooddata/sdk-model";
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
import { getPageSizeFromProperties, getPaginationFromProperties } from "../../../utils/propertiesHelper.js";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor.js";
import { MIN_VISUALIZATION_HEIGHT_TABLE_REPEATER_FLEXIBLE_LAYOUT } from "../constants.js";
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
            pageSize: insightConversion("pageSize", { cardinality: "scalar" }, (insight) => {
                const pagination = getPaginationFromProperties(insightProperties(insight));
                const pageSize = getPageSizeFromProperties(insightProperties(insight));
                // Only include pageSize when pagination is enabled and pageSize is set
                return pagination?.enabled && pageSize !== undefined ? pageSize : undefined;
            }),
            locale: localeInsightConversion("locale"),
            execConfig: executionConfigInsightConversion("execConfig"),
        }),
        additionalFactories: pivotTableNextAdditionalFactories,
    });

    public getMeta(): IVisualizationMeta {
        return {
            documentationUrl:
                "https://www.gooddata.com/docs/gooddata-ui/latest/references/visual_components/pivot_table_next",
            supportsExport: true,
            supportsZooming: false,
        };
    }
}
