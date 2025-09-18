// (C) 2021-2025 GoodData Corporation

import { IInsight, IInsightDefinition, ISettings } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { IHeadlineProps } from "@gooddata/sdk-ui-charts";

import {
    multipleSecondaryMeasuresBucketConversion,
    singleSecondaryMeasureBucketConversion,
} from "./headlineBucketConversion.js";
import { headlineConfigFromInsight } from "./headlineConfigFromInsight.js";
import { PluggableHeadline } from "./PluggableHeadline.js";
import { IFluidLayoutDescriptor } from "../../../interfaces/LayoutDescriptor.js";
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
    singleMeasureBucketConversion,
} from "../../../utils/embeddingCodeGenerator/index.js";
import { MAX_VISUALIZATION_HEIGHT } from "../constants.js";

const hasSecondaryMeasure = (insight: IInsightDefinition) =>
    insight.insight.buckets.filter((bucket) => bucket.items.length > 0).length > 1;

export class HeadlineDescriptor implements IVisualizationDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableHeadline(params);
    }

    public getSizeInfo(
        insight: IInsightDefinition,
        layoutDescriptor: IFluidLayoutDescriptor,
        _settings: ISettings,
    ): IVisualizationSizeInfo {
        return {
            width: {
                default: 2,
                min: 2,
                max: layoutDescriptor.gridColumnsCount,
            },
            height: {
                default: this.getDefaultHeight(insight),
                min: this.getMinHeight(insight),
                max: this.getMaxHeight(insight),
            },
        };
    }

    private getDefaultHeight(insight: IInsightDefinition): number {
        return hasSecondaryMeasure(insight) ? 11 : 8;
    }

    private getMinHeight(insight: IInsightDefinition): number {
        return hasSecondaryMeasure(insight) ? 10 : 6;
    }

    private getMaxHeight(_insight: IInsightDefinition): number {
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
