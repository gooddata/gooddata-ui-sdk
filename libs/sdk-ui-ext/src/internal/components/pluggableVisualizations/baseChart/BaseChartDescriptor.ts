// (C) 2021-2022 GoodData Corporation

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
    MAX_VISUALIZATION_HEIGHT,
    MIN_VISUALIZATION_HEIGHT,
    MIDDLE_VISUALIZATION_HEIGHT,
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

    protected getDefaultHeight(enableCustomHeight: boolean): number {
        if (!enableCustomHeight) {
            return DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT;
        }
        return MIDDLE_VISUALIZATION_HEIGHT;
    }

    protected getMinHeight(enableCustomHeight: boolean): number {
        if (!enableCustomHeight) {
            return DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT;
        }
        return MIN_VISUALIZATION_HEIGHT;
    }

    protected getMaxHeight(enableCustomHeight: boolean): number {
        if (!enableCustomHeight) {
            return DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT;
        }
        return MAX_VISUALIZATION_HEIGHT;
    }

    public applyDrillDown(
        insight: IInsight,
        drillDownContext: IDrillDownContext,
        backendSupportsElementUris: boolean,
    ): IInsight {
        const intersection = drillDownContext.event.drillContext.intersection;
        const withFilters = addIntersectionFiltersToInsight(
            insight,
            intersection,
            backendSupportsElementUris,
        );
        return modifyBucketsAttributesForDrillDown(withFilters, drillDownContext.drillDefinition);
    }
}
