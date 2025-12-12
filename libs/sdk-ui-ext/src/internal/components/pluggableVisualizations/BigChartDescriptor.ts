// (C) 2021-2025 GoodData Corporation

import { type IInsightDefinition, type ISettings } from "@gooddata/sdk-model";

import { BaseChartDescriptor } from "./baseChart/BaseChartDescriptor.js";
import { MIN_VISUALIZATION_HEIGHT_FLEXIBLE_LAYOUT } from "./constants.js";
import { type IFluidLayoutDescriptor } from "../../interfaces/LayoutDescriptor.js";
import {
    type IVisualizationSizeInfo,
    type PluggableVisualizationFactory,
} from "../../interfaces/VisualizationDescriptor.js";

export abstract class BigChartDescriptor extends BaseChartDescriptor {
    public abstract override getFactory(): PluggableVisualizationFactory;

    public override getSizeInfo(
        _insight: IInsightDefinition,
        layoutDescriptor: IFluidLayoutDescriptor,
        settings: ISettings,
    ): IVisualizationSizeInfo {
        return {
            width: {
                default: 4,
                min: 2,
                max: layoutDescriptor.gridColumnsCount,
            },
            height: {
                default: this.getDefaultHeight(settings),
                min: this.getMinHeight(settings),
                max: this.getMaxHeight(settings),
            },
        };
    }

    protected override getMinHeight(_settings: ISettings): number {
        // Flexible layout is always enabled now
        return MIN_VISUALIZATION_HEIGHT_FLEXIBLE_LAYOUT;
    }
}
