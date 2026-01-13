// (C) 2025-2026 GoodData Corporation

import { type IInsightDefinition, type ISettings } from "@gooddata/sdk-model";
import { type IGeoChartNextProps } from "@gooddata/sdk-ui-geo/next";

import { PluggableGeoPushpinChartNext } from "./PluggableGeoPushpinChartNext.js";
import { type IFluidLayoutDescriptor } from "../../../interfaces/LayoutDescriptor.js";
import {
    type IVisualizationDescriptor,
    type IVisualizationMeta,
    type IVisualizationSizeInfo,
    type PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor.js";
import {
    executionConfigInsightConversion,
    getInsightToPropsConverter,
    getReactEmbeddingCodeGenerator,
    insightConversion,
    sdkModelPropMetas,
} from "../../../utils/embeddingCodeGenerator/index.js";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor.js";
import { chartAdditionalFactories } from "../chartCodeGenUtils.js";
import { MAX_VISUALIZATION_HEIGHT, MIDDLE_VISUALIZATION_HEIGHT } from "../constants.js";
import { geoConfigFromInsight } from "./geoConfigBuilder.js";
import { buildGeoChartNextGlobalFilters, buildGeoChartNextLayers } from "./geoEmbeddingLayers.js";

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

    private readonly geoChartEmbeddingCodeGenerator = getReactEmbeddingCodeGenerator({
        component: {
            importType: "named",
            name: "GeoChartNext",
            package: "@gooddata/sdk-ui-geo/next",
        },
        insightToProps: getInsightToPropsConverter<IGeoChartNextProps>({
            type: insightConversion("type", { cardinality: "scalar" }, () => "pushpin"),
            layers: insightConversion(
                "layers",
                {
                    typeImport: {
                        importType: "named",
                        name: "IGeoLayer",
                        package: "@gooddata/sdk-ui-geo/next",
                    },
                    cardinality: "array",
                },
                (insight) => buildGeoChartNextLayers(insight, "pushpin"),
            ),
            filters: insightConversion(
                "filters",
                sdkModelPropMetas.Filter.Multiple,
                buildGeoChartNextGlobalFilters,
            ),
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

    public getEmbeddingCode: ReturnType<typeof getReactEmbeddingCodeGenerator> = (insight, config) => {
        const layers = buildGeoChartNextLayers(insight, "pushpin");
        if (!layers.length) {
            return "";
        }

        return this.geoChartEmbeddingCodeGenerator(insight, config);
    };

    public getMeta(): IVisualizationMeta {
        return {
            documentationUrl:
                "https://www.gooddata.com/docs/gooddata-ui/latest/references/visual_components/geo_pushpin_chart_next",
            supportsExport: true,
            supportsZooming: false,
        };
    }
}
