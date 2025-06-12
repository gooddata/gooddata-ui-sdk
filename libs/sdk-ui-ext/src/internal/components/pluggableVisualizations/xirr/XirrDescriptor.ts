// (C) 2021-2022 GoodData Corporation
import { IInsight, IInsightDefinition, ISettings } from "@gooddata/sdk-model";
import { IXirrProps } from "@gooddata/sdk-ui-charts";
import { BucketNames } from "@gooddata/sdk-ui";

import {
    IVisualizationSizeInfo,
    IVisualizationDescriptor,
    PluggableVisualizationFactory,
    IVisualizationMeta,
} from "../../../interfaces/VisualizationDescriptor.js";
import { IFluidLayoutDescriptor } from "../../../interfaces/LayoutDescriptor.js";
import { PluggableXirr } from "./PluggableXirr.js";
import { DASHBOARD_LAYOUT_DEFAULT_KPI_HEIGHT, MAX_VISUALIZATION_HEIGHT } from "../constants.js";
import {
    executionConfigInsightConversion,
    filtersInsightConversion,
    getInsightToPropsConverter,
    getReactEmbeddingCodeGenerator,
    localeInsightConversion,
    singleAttributeBucketConversion,
    singleMeasureBucketConversion,
} from "../../../utils/embeddingCodeGenerator/index.js";

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
        insightToProps: getInsightToPropsConverter<IXirrProps>({
            measure: singleMeasureBucketConversion("measure", BucketNames.MEASURES),
            attribute: singleAttributeBucketConversion("attribute", BucketNames.ATTRIBUTE),
            filters: filtersInsightConversion("filters"),
            locale: localeInsightConversion("locale"),
            execConfig: executionConfigInsightConversion("execConfig"),
        }),
    });

    public getMeta(): IVisualizationMeta {
        return {
            supportsExport: false,
            supportsZooming: false,
        };
    }
}
