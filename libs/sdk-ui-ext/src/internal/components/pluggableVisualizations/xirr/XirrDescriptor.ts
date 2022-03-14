// (C) 2021-2022 GoodData Corporation

import { bucketAttribute, bucketMeasure, IInsight, IInsightDefinition } from "@gooddata/sdk-model";

import {
    IVisualizationSizeInfo,
    IVisualizationDescriptor,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor";
import { IFluidLayoutDescriptor } from "../../../interfaces/LayoutDescriptor";

import { PluggableXirr } from "./PluggableXirr";
import { DASHBOARD_LAYOUT_DEFAULT_KPI_HEIGHT, MAX_VISUALIZATION_HEIGHT } from "../constants";
import { ISettings } from "@gooddata/sdk-backend-spi";
import { getReactEmbeddingCodeGenerator } from "../../../utils/embeddingCodeGenerator";
import {
    bucketConversion,
    getInsightToPropsConverter,
    insightConversion,
} from "../../../utils/embeddingCodeGenerator/insightToPropsConverter";
import { IXirrBucketProps } from "@gooddata/sdk-ui-charts";
import { BucketNames } from "@gooddata/sdk-ui";
import { insightFilters } from "@gooddata/sdk-model";

export class XirrDescriptor implements IVisualizationDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableXirr(params);
    }

    public getSizeInfo(
        _insight: IInsightDefinition,
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
                default: this.getDefaultHeight(settings.enableKDWidgetCustomHeight),
                min: this.getMinHeight(settings.enableKDWidgetCustomHeight),
                max: this.getMaxHeight(settings.enableKDWidgetCustomHeight),
            },
        };
    }

    private getDefaultHeight(enableCustomHeight: boolean): number {
        if (!enableCustomHeight) {
            return DASHBOARD_LAYOUT_DEFAULT_KPI_HEIGHT;
        }
        return 8;
    }

    private getMinHeight(enableCustomHeight: boolean): number {
        if (!enableCustomHeight) {
            return DASHBOARD_LAYOUT_DEFAULT_KPI_HEIGHT;
        }
        return 6;
    }

    private getMaxHeight(enableCustomHeight: boolean): number {
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
            name: "Xirr",
            package: "@gooddata/sdk-ui-charts",
        },
        insightToProps: getInsightToPropsConverter<IXirrBucketProps>({
            measure: bucketConversion("measure", BucketNames.MEASURES, bucketMeasure),
            attribute: bucketConversion("attribute", BucketNames.ATTRIBUTE, bucketAttribute),
            filters: insightConversion("filters", insightFilters),
        }),
    });
}
