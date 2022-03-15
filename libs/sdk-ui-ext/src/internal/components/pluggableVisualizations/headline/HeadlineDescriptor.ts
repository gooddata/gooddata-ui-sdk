// (C) 2021-2022 GoodData Corporation
import { bucketMeasure, IInsight, IInsightDefinition } from "@gooddata/sdk-model";
import { ISettings } from "@gooddata/sdk-backend-spi";
import {
    IVisualizationSizeInfo,
    IVisualizationDescriptor,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor";
import { IFluidLayoutDescriptor } from "../../../interfaces/LayoutDescriptor";
import { PluggableHeadline } from "./PluggableHeadline";
import { DASHBOARD_LAYOUT_DEFAULT_KPI_HEIGHT, MAX_VISUALIZATION_HEIGHT } from "../constants";
import { getReactEmbeddingCodeGenerator } from "../../../utils/embeddingCodeGenerator";
import {
    bucketConversion,
    getInsightToPropsConverter,
    insightConversion,
} from "../../../utils/embeddingCodeGenerator/insightToPropsConverter";
import { IHeadlineProps } from "@gooddata/sdk-ui-charts";
import { BucketNames } from "@gooddata/sdk-ui";
import { insightFilters } from "@gooddata/sdk-model";

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
            primaryMeasure: bucketConversion("primaryMeasure", BucketNames.MEASURES, bucketMeasure),
            secondaryMeasure: bucketConversion(
                "secondaryMeasure",
                BucketNames.SECONDARY_MEASURES,
                bucketMeasure,
            ),
            filters: insightConversion("filters", insightFilters),
        }),
    });
}
