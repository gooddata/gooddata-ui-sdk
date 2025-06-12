// (C) 2021-2024 GoodData Corporation
import { ISettings, IInsight, IInsightDefinition } from "@gooddata/sdk-model";
import { IHeadlineProps } from "@gooddata/sdk-ui-charts";
import { BucketNames } from "@gooddata/sdk-ui";

import {
    IVisualizationSizeInfo,
    IVisualizationDescriptor,
    PluggableVisualizationFactory,
    IVisualizationMeta,
} from "../../../interfaces/VisualizationDescriptor.js";
import { IFluidLayoutDescriptor } from "../../../interfaces/LayoutDescriptor.js";
import { PluggableHeadline } from "./PluggableHeadline.js";
import { DASHBOARD_LAYOUT_DEFAULT_KPI_HEIGHT, MAX_VISUALIZATION_HEIGHT } from "../constants.js";
import {
    executionConfigInsightConversion,
    filtersInsightConversion,
    getInsightToPropsConverter,
    getReactEmbeddingCodeGenerator,
    singleMeasureBucketConversion,
    localeInsightConversion,
    insightConversion,
} from "../../../utils/embeddingCodeGenerator/index.js";
import { headlineConfigFromInsight } from "./headlineConfigFromInsight.js";
import {
    singleSecondaryMeasureBucketConversion,
    multipleSecondaryMeasuresBucketConversion,
} from "./headlineBucketConversion.js";

const hasSecondaryMeasure = (insight: IInsightDefinition) =>
    insight.insight.buckets.filter((bucket) => bucket.items.length > 0).length > 1;

export class HeadlineDescriptor implements IVisualizationDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableHeadline(params);
    }

    public getSizeInfo(
        insight: IInsightDefinition,
        layoutDescriptor: IFluidLayoutDescriptor,
        settings: ISettings,
    ): IVisualizationSizeInfo {
        return {
            width: {
                default: 2,
                min: 2,
                max: layoutDescriptor.gridColumnsCount,
            },
            height: {
                default: this.getDefaultHeight(insight, settings.enableKDWidgetCustomHeight),
                min: this.getMinHeight(insight, settings.enableKDWidgetCustomHeight),
                max: this.getMaxHeight(insight, settings.enableKDWidgetCustomHeight),
            },
        };
    }

    private getDefaultHeight(insight: IInsightDefinition, enableCustomHeight: boolean): number {
        if (!enableCustomHeight) {
            return DASHBOARD_LAYOUT_DEFAULT_KPI_HEIGHT;
        }
        return hasSecondaryMeasure(insight) ? 11 : 8;
    }

    private getMinHeight(insight: IInsightDefinition, enableCustomHeight: boolean): number {
        if (!enableCustomHeight) {
            return DASHBOARD_LAYOUT_DEFAULT_KPI_HEIGHT;
        }
        return hasSecondaryMeasure(insight) ? 10 : 6;
    }

    private getMaxHeight(_insight: IInsightDefinition, enableCustomHeight: boolean): number {
        if (!enableCustomHeight) {
            return DASHBOARD_LAYOUT_DEFAULT_KPI_HEIGHT;
        }
        return MAX_VISUALIZATION_HEIGHT;
    }

    public applyDrillDown(insight: IInsight): IInsight {
        return insight;
    }

    public getEmbeddingCode = getReactEmbeddingCodeGenerator({
        component: {
            importType: "named",
            name: "Headline",
            package: "@gooddata/sdk-ui-charts",
        },
        insightToProps: getInsightToPropsConverter<IHeadlineProps>({
            primaryMeasure: singleMeasureBucketConversion("primaryMeasure", BucketNames.MEASURES),
            secondaryMeasures: multipleSecondaryMeasuresBucketConversion(
                "secondaryMeasures",
                BucketNames.SECONDARY_MEASURES,
            ),
            secondaryMeasure: singleSecondaryMeasureBucketConversion(
                "secondaryMeasure",
                BucketNames.SECONDARY_MEASURES,
            ),
            filters: filtersInsightConversion("filters"),
            locale: localeInsightConversion("locale"),
            execConfig: executionConfigInsightConversion("execConfig"),
            config: insightConversion(
                "config",
                {
                    typeImport: {
                        importType: "named",
                        name: "IChartConfig",
                        package: "@gooddata/sdk-ui-charts",
                    },
                    cardinality: "scalar",
                },
                headlineConfigFromInsight,
            ),
        }),
    });

    public getMeta(settings?: ISettings): IVisualizationMeta {
        return {
            documentationUrl: "https://sdk.gooddata.com/gooddata-ui/docs/headline_component.html",
            supportsExport: settings?.enableHeadlineExport ?? true,
            supportsZooming: false,
        };
    }
}
