// (C) 2021-2025 GoodData Corporation

import { IInsightDefinition, ISettings } from "@gooddata/sdk-model";

import { BaseChartDescriptor } from "./baseChart/BaseChartDescriptor.js";
import {
    DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT,
    MIDDLE_VISUALIZATION_HEIGHT,
    MIN_VISUALIZATION_HEIGHT_FLEXIBLE_LAYOUT,
} from "./constants.js";
import { IFluidLayoutDescriptor } from "../../interfaces/LayoutDescriptor.js";
import {
    IVisualizationSizeInfo,
    PluggableVisualizationFactory,
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
                default: settings.enableFlexibleDashboardLayout ? 4 : 6,
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

    protected override getMinHeight(settings: ISettings): number {
        const { enableKDWidgetCustomHeight, enableFlexibleDashboardLayout } = settings;
        if (!enableKDWidgetCustomHeight) {
            return DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT;
        }
        if (enableFlexibleDashboardLayout) {
            return MIN_VISUALIZATION_HEIGHT_FLEXIBLE_LAYOUT;
        }
        return MIDDLE_VISUALIZATION_HEIGHT;
    }
}
