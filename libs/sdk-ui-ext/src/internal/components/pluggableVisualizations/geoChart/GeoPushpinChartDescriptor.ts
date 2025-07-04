// (C) 2021-2025 GoodData Corporation
import { IInsightDefinition, ISettings } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { IGeoPushpinChartLatitudeLongitudeProps, IGeoPushpinChartProps } from "@gooddata/sdk-ui-geo";

import {
    IVisualizationDescriptor,
    IVisualizationMeta,
    IVisualizationSizeInfo,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor.js";
import { IFluidLayoutDescriptor } from "../../../interfaces/LayoutDescriptor.js";
import { PluggableGeoPushpinChart } from "./PluggableGeoPushpinChart.js";
import {
    DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT,
    MAX_VISUALIZATION_HEIGHT,
    MIDDLE_VISUALIZATION_HEIGHT,
} from "../constants.js";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor.js";
import {
    executionConfigInsightConversion,
    filtersInsightConversion,
    getInsightToPropsConverter,
    getReactEmbeddingCodeGenerator,
    insightConversion,
    localeInsightConversion,
    singleAttributeBucketConversion,
    singleAttributeOrMeasureBucketConversion,
    sortsInsightConversion,
} from "../../../utils/embeddingCodeGenerator/index.js";
import { geoConfigFromInsight, geoInsightConversion } from "./geoConfigCodeGenerator.js";
import { chartAdditionalFactories } from "../chartCodeGenUtils.js";

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
                default: this.getDefaultHeight(settings),
                min: this.getDefaultHeight(settings),
                max: this.getMaxHeight(settings),
            },
        };
    }

    protected getDefaultHeight(settings: ISettings): number {
        const { enableKDWidgetCustomHeight } = settings;
        if (!enableKDWidgetCustomHeight) {
            return DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT;
        }
        return MIDDLE_VISUALIZATION_HEIGHT;
    }

    protected getMaxHeight(settings: ISettings) {
        const { enableKDWidgetCustomHeight } = settings;
        if (!enableKDWidgetCustomHeight) {
            return DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT;
        }
        return MAX_VISUALIZATION_HEIGHT;
    }

    public getEmbeddingCode = getReactEmbeddingCodeGenerator({
        component: {
            importType: "named",
            name: "GeoPushpinChart",
            package: "@gooddata/sdk-ui-geo",
        },
        insightToProps: getInsightToPropsConverter<
            IGeoPushpinChartProps | IGeoPushpinChartLatitudeLongitudeProps
        >({
            location: geoInsightConversion("location", BucketNames.LOCATION),
            latitude: geoInsightConversion("latitude", BucketNames.LATITUDE),
            longitude: geoInsightConversion("longitude", BucketNames.LONGITUDE),
            size: singleAttributeOrMeasureBucketConversion("size", BucketNames.SIZE),
            color: singleAttributeOrMeasureBucketConversion("color", BucketNames.COLOR),
            segmentBy: singleAttributeBucketConversion("segmentBy", BucketNames.SEGMENT),
            filters: filtersInsightConversion("filters"),
            sortBy: sortsInsightConversion("sortBy"),
            config: insightConversion(
                "config",
                {
                    typeImport: {
                        importType: "named",
                        name: "IGeoConfig",
                        package: "@gooddata/sdk-ui-geo",
                    },
                    cardinality: "scalar",
                },
                geoConfigFromInsight,
            ),
            locale: localeInsightConversion("locale"),
            execConfig: executionConfigInsightConversion("execConfig"),
        }),
        additionalFactories: chartAdditionalFactories({
            getColorMappingPredicatePackage: "@gooddata/sdk-ui-geo",
        }),
    });

    public getMeta(): IVisualizationMeta {
        return {
            documentationUrl: "https://sdk.gooddata.com/gooddata-ui/docs/geo_pushpin_chart_component.html",
            supportsExport: true,
            supportsZooming: false,
        };
    }
}
