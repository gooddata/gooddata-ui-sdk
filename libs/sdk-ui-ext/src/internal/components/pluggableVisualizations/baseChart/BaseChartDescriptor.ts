// (C) 2021-2025 GoodData Corporation

import { IInsight, IInsightDefinition, ISettings } from "@gooddata/sdk-model";
import {
    IVisualizationDescriptor,
    IVisualizationMeta,
    IVisualizationSizeInfo,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor.js";
import { IFluidLayoutDescriptor } from "../../../interfaces/LayoutDescriptor.js";
import {
    DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT,
    MIN_VISUALIZATION_HEIGHT,
    MIDDLE_VISUALIZATION_HEIGHT,
    MIDDLE_VISUALIZATION_HEIGHT_FLEXIBLE_LAYOUT,
    MIN_VISUALIZATION_HEIGHT_FLEXIBLE_LAYOUT,
    MAX_NEW_VISUALIZATION_HEIGHT,
    MAX_VISUALIZATION_HEIGHT,
} from "../constants.js";
import { IDrillDownContext } from "../../../interfaces/Visualization.js";
import { addIntersectionFiltersToInsight, modifyBucketsAttributesForDrillDown } from "../drillDownUtil.js";

export abstract class BaseChartDescriptor implements IVisualizationDescriptor {
    public abstract getFactory(): PluggableVisualizationFactory;
    public abstract getMeta(): IVisualizationMeta;

    public getSizeInfo(
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

    protected getDefaultHeight(settings: ISettings): number {
        const { enableKDWidgetCustomHeight, enableFlexibleDashboardLayout } = settings;
        if (!enableKDWidgetCustomHeight) {
            return DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT;
        }
        if (enableFlexibleDashboardLayout) {
            return MIDDLE_VISUALIZATION_HEIGHT_FLEXIBLE_LAYOUT;
        }
        return MIDDLE_VISUALIZATION_HEIGHT;
    }

    protected getMinHeight(settings: ISettings): number {
        const { enableKDWidgetCustomHeight, enableFlexibleDashboardLayout } = settings;
        if (!enableKDWidgetCustomHeight) {
            return DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT;
        }
        if (enableFlexibleDashboardLayout) {
            return MIN_VISUALIZATION_HEIGHT_FLEXIBLE_LAYOUT;
        }
        return MIN_VISUALIZATION_HEIGHT;
    }

    protected getMaxHeight(settings: ISettings) {
        const { enableKDWidgetCustomHeight, enableFlexibleDashboardLayout } = settings;
        if (!enableKDWidgetCustomHeight) {
            return DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT;
        }
        if (enableFlexibleDashboardLayout) {
            return MAX_NEW_VISUALIZATION_HEIGHT;
        }
        return MAX_VISUALIZATION_HEIGHT;
    }

    public applyDrillDown(
        insight: IInsight,
        drillDownContext: IDrillDownContext,
        backendSupportsElementUris: boolean,
        enableDuplicatedLabelValuesInAttributeFilter: boolean,
    ): IInsight {
        const intersection = drillDownContext.event.drillContext.intersection;
        const withFilters = addIntersectionFiltersToInsight(
            insight,
            intersection,
            backendSupportsElementUris,
            enableDuplicatedLabelValuesInAttributeFilter,
        );
        return modifyBucketsAttributesForDrillDown(withFilters, drillDownContext.drillDefinition);
    }
}
