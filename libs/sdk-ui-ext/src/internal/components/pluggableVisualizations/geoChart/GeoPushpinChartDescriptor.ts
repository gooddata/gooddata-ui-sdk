// (C) 2021-2022 GoodData Corporation
import {
    IInsightDefinition,
    insightFilters,
    insightSorts,
    bucketAttribute,
    bucketItems,
    IBucket,
    IAttributeOrMeasure,
} from "@gooddata/sdk-model";
import { ISettings } from "@gooddata/sdk-backend-spi";
import { BucketNames } from "@gooddata/sdk-ui";
import { IGeoConfig, IGeoPushpinChartProps } from "@gooddata/sdk-ui-geo";

import {
    IVisualizationDescriptor,
    IVisualizationSizeInfo,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor";
import { IFluidLayoutDescriptor } from "../../../interfaces/LayoutDescriptor";
import { PluggableGeoPushpinChart } from "./PluggableGeoPushpinChart";
import { DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT, MIDDLE_VISUALIZATION_HEIGHT } from "../constants";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor";
import {
    bucketConversion,
    getConfigFromPropsConverter,
    getInsightToPropsConverter,
    getReactEmbeddingCodeGenerator,
    insightConversion,
} from "../../../utils/embeddingCodeGenerator";

const supportedGeoConfigProperties = new Set<keyof IGeoConfig>([
    "center",
    "cooperativeGestures",
    "legend",
    "limit",
    "selectedSegmentItems",
    "separators",
    "viewport",
    "points",
    "showLabels",
]);

export class GeoPushpinChartDescriptor extends BaseChartDescriptor implements IVisualizationDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableGeoPushpinChart(params);
    }

    public getSizeInfo(
        _insight: IInsightDefinition,
        layoutDescriptor: IFluidLayoutDescriptor,
        settings: ISettings,
    ): IVisualizationSizeInfo {
        return {
            width: {
                default: 6,
                min: 6,
                max: layoutDescriptor.gridColumnsCount,
            },
            height: {
                default: this.getDefaultHeight(settings.enableKDWidgetCustomHeight),
                min: this.getDefaultHeight(settings.enableKDWidgetCustomHeight),
                max: this.getMaxHeight(settings.enableKDWidgetCustomHeight),
            },
        };
    }

    public getEmbeddingCode = getReactEmbeddingCodeGenerator({
        component: {
            importType: "named",
            name: "GeoPushpinChart",
            package: "@gooddata/sdk-ui-geo",
        },
        insightToProps: getInsightToPropsConverter<IGeoPushpinChartProps>({
            location: bucketConversion("location", BucketNames.LOCATION, bucketAttribute),
            size: bucketConversion("size", BucketNames.SIZE, firstBucketItem),
            color: bucketConversion("color", BucketNames.COLOR, firstBucketItem),
            segmentBy: bucketConversion("segmentBy", BucketNames.SEGMENT, bucketAttribute),
            filters: insightConversion("filters", insightFilters),
            sortBy: insightConversion("sortBy", insightSorts),
            config: insightConversion("config", getConfigFromPropsConverter(supportedGeoConfigProperties)),
        }),
    });

    protected getMinHeight(enableCustomHeight: boolean): number {
        if (!enableCustomHeight) {
            return DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT;
        }
        return MIDDLE_VISUALIZATION_HEIGHT;
    }
}

function firstBucketItem(bucket: IBucket): IAttributeOrMeasure | undefined {
    return bucketItems(bucket)?.[0];
}
