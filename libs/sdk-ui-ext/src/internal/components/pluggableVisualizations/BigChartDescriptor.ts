// (C) 2021-2022 GoodData Corporation

import { IInsightDefinition, ISettings } from "@gooddata/sdk-model";

import {
    IVisualizationSizeInfo,
    PluggableVisualizationFactory,
} from "../../interfaces/VisualizationDescriptor.js";
import { IFluidLayoutDescriptor } from "../../interfaces/LayoutDescriptor.js";
import { MIDDLE_VISUALIZATION_HEIGHT, DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT } from "./constants.js";
import { BaseChartDescriptor } from "./baseChart/BaseChartDescriptor.js";

export abstract class BigChartDescriptor extends BaseChartDescriptor {
    public abstract getFactory(): PluggableVisualizationFactory;

    public getSizeInfo(
        _insight: IInsightDefinition,
        layoutDescriptor: IFluidLayoutDescriptor,
        settings: ISettings,
    ): IVisualizationSizeInfo {
        return {
            width: {
                default: 6,
                min: 4,
                max: layoutDescriptor.gridColumnsCount,
            },
            height: {
                default: this.getDefaultHeight(settings.enableKDWidgetCustomHeight),
                min: this.getMinHeight(settings.enableKDWidgetCustomHeight),
                max: this.getMaxHeight(settings.enableKDWidgetCustomHeight),
            },
        };
    }

    protected getMinHeight(enableCustomHeight: boolean): number {
        if (!enableCustomHeight) {
            return DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT;
        }
        return MIDDLE_VISUALIZATION_HEIGHT;
    }
}
