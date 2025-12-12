// (C) 2021-2025 GoodData Corporation

import { type IInsight, type IInsightDefinition, type ISettings } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { type IXirrProps } from "@gooddata/sdk-ui-charts";

import { PluggableXirr } from "./PluggableXirr.js";
import { type IFluidLayoutDescriptor } from "../../../interfaces/LayoutDescriptor.js";
import {
    type IVisualizationDescriptor,
    type IVisualizationMeta,
    type IVisualizationSizeInfo,
    type PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor.js";
import {
    executionConfigInsightConversion,
    filtersInsightConversion,
    getInsightToPropsConverter,
    getReactEmbeddingCodeGenerator,
    localeInsightConversion,
    singleAttributeBucketConversion,
    singleMeasureBucketConversion,
} from "../../../utils/embeddingCodeGenerator/index.js";
import { MAX_VISUALIZATION_HEIGHT } from "../constants.js";

export class XirrDescriptor implements IVisualizationDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableXirr(params);
    }

    public getSizeInfo(
        _insight: IInsightDefinition,
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
                default: this.getDefaultHeight(),
                min: this.getMinHeight(),
                max: this.getMaxHeight(),
            },
        };
    }

    private getDefaultHeight(): number {
        return 8;
    }

    private getMinHeight(): number {
        return 6;
    }

    private getMaxHeight(): number {
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
