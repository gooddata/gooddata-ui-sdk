// (C) 2021-2025 GoodData Corporation

import { IInsightDefinition, ISettings } from "@gooddata/sdk-model";

import {
    IVisualizationSizeInfo,
    PluggableVisualizationFactory,
} from "../../interfaces/VisualizationDescriptor.js";
import { IFluidLayoutDescriptor } from "../../interfaces/LayoutDescriptor.js";
import {
    MIDDLE_VISUALIZATION_HEIGHT,
    DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT,
    MIN_VISUALIZATION_HEIGHT_FLEXIBLE_LAYOUT,
} from "./constants.js";
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
                default: settings.enableDashboardFlexibleLayout ? 4 : 6,
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

    protected getMinHeight(settings: ISettings): number {
        const { enableKDWidgetCustomHeight, enableDashboardFlexibleLayout } = settings;
        if (!enableKDWidgetCustomHeight) {
            return DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT;
        }
        if (enableDashboardFlexibleLayout) {
            return MIN_VISUALIZATION_HEIGHT_FLEXIBLE_LAYOUT;
        }
        return MIDDLE_VISUALIZATION_HEIGHT;
    }
}
