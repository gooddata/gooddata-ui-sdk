// (C) 2021-2022 GoodData Corporation
import { IInsightDefinition, ISettings } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { IGeoPushpinChartProps } from "@gooddata/sdk-ui-geo";

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
    filtersInsightConversion,
    getInsightToPropsConverter,
    getReactEmbeddingCodeGenerator,
    insightConversion,
    singleAttributeBucketConversion,
    singleAttributeOrMeasureBucketConversion,
    sortsInsightConversion,
} from "../../../utils/embeddingCodeGenerator";
import { geoConfigFromInsight } from "./geoConfigFromInsight";
import { chartAdditionalFactories } from "../chartCodeGenUtils";

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
            location: singleAttributeBucketConversion("location", BucketNames.LOCATION),
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
        }),
        additionalFactories: chartAdditionalFactories({
            getColorMappingPredicatePackage: "@gooddata/sdk-ui-geo",
        }),
    });

    protected getMinHeight(enableCustomHeight: boolean): number {
        if (!enableCustomHeight) {
            return DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT;
        }
        return MIDDLE_VISUALIZATION_HEIGHT;
    }
}
