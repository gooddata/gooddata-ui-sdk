// (C) 2024-2025 GoodData Corporation

import { IRepeaterProps } from "@gooddata/sdk-ui-charts";
import { BucketNames } from "@gooddata/sdk-ui";
import { IInsightDefinition, ISettings } from "@gooddata/sdk-model";

import {
    IVisualizationDescriptor,
    IVisualizationMeta,
    IVisualizationSizeInfo,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor.js";
import { PluggableRepeater } from "./PluggableRepeater.js";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor.js";
import {
    executionConfigInsightConversion,
    filtersInsightConversion,
    getInsightToPropsConverter,
    getReactEmbeddingCodeGenerator,
    localeInsightConversion,
    multipleAttributesOrMeasuresBucketConversion,
    singleAttributeBucketConversion,
} from "../../../utils/embeddingCodeGenerator/index.js";
import { chartAdditionalFactories, chartConfigInsightConversion } from "../chartCodeGenUtils.js";
import { IFluidLayoutDescriptor } from "../../../interfaces/LayoutDescriptor.js";
import {
    DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT,
    MIN_VISUALIZATION_HEIGHT,
    MIN_VISUALIZATION_HEIGHT_TABLE_REPEATER_FLEXIBLE_LAYOUT,
} from "../constants.js";

export class RepeaterDescriptor extends BaseChartDescriptor implements IVisualizationDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableRepeater(params);
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

    public getEmbeddingCode = getReactEmbeddingCodeGenerator({
        component: {
            importType: "named",
            name: "Repeater",
            package: "@gooddata/sdk-ui-charts",
        },
        insightToProps: getInsightToPropsConverter<IRepeaterProps>({
            attribute: singleAttributeBucketConversion("attribute", BucketNames.ATTRIBUTE),
            columns: multipleAttributesOrMeasuresBucketConversion("columns", BucketNames.COLUMNS),
            viewBy: singleAttributeBucketConversion("viewBy", BucketNames.VIEW),
            filters: filtersInsightConversion("filters"),
            config: chartConfigInsightConversion("config"),
            locale: localeInsightConversion("locale"),
            execConfig: executionConfigInsightConversion("execConfig"),
        }),
        additionalFactories: chartAdditionalFactories(),
    });

    public getMeta(): IVisualizationMeta {
        return {
            documentationUrl: "https://sdk.gooddata.com/gooddata-ui/docs/repeater_chart_component.html",
            supportsExport: false,
            supportsZooming: false,
        };
    }
}
