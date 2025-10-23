// (C) 2025 GoodData Corporation

import { IInsightDefinition, ISettings } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { IGeoPushpinChartNextProps } from "@gooddata/sdk-ui-geo/next";

import { PluggableGeoPushpinChartNext } from "./PluggableGeoPushpinChartNext.js";
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
    singleAttributeBucketConversion,
    singleAttributeOrMeasureBucketConversion,
    sortsInsightConversion,
} from "../../../utils/embeddingCodeGenerator/index.js";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor.js";
import { chartAdditionalFactories } from "../chartCodeGenUtils.js";
import { MAX_VISUALIZATION_HEIGHT, MIDDLE_VISUALIZATION_HEIGHT } from "../constants.js";
import { geoConfigFromInsight, geoInsightConversion } from "./geoConfigBuilder.js";

/**
 * @alpha
 */
export class GeoPushpinChartNextDescriptor extends BaseChartDescriptor implements IVisualizationDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableGeoPushpinChartNext(params);
    }

    public override getSizeInfo(
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

    protected override getDefaultHeight(_settings: ISettings): number {
        return MIDDLE_VISUALIZATION_HEIGHT;
    }

    protected override getMaxHeight(_settings: ISettings): number {
        return MAX_VISUALIZATION_HEIGHT;
    }

    public getEmbeddingCode = getReactEmbeddingCodeGenerator({
        component: {
            importType: "named",
            name: "GeoPushpinChartNext",
            package: "@gooddata/sdk-ui-geo/next",
        },
        insightToProps: getInsightToPropsConverter<IGeoPushpinChartNextProps>({
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
                        name: "IGeoPushpinChartNextConfig",
                        package: "@gooddata/sdk-ui-geo/next",
                    },
                    cardinality: "scalar",
                },
                geoConfigFromInsight,
            ),
            execConfig: executionConfigInsightConversion("execConfig"),
        }),
        additionalFactories: chartAdditionalFactories({
            getColorMappingPredicatePackage: "@gooddata/sdk-ui-geo",
        }),
    });

    public getMeta(): IVisualizationMeta {
        return {
            documentationUrl: "https://sdk.gooddata.com/gooddata-ui/docs/geo_pushpin_chart_next.html",
            supportsExport: true,
            supportsZooming: false,
        };
    }
}
