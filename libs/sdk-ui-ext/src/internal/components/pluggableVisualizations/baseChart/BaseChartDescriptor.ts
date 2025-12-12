// (C) 2021-2025 GoodData Corporation

import { type IInsight, type IInsightDefinition, type ISettings } from "@gooddata/sdk-model";

import { type IFluidLayoutDescriptor } from "../../../interfaces/LayoutDescriptor.js";
import { type IDrillDownContext } from "../../../interfaces/Visualization.js";
import {
    type IVisualizationDescriptor,
    type IVisualizationMeta,
    type IVisualizationSizeInfo,
    type PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor.js";
import {
    MAX_NEW_VISUALIZATION_HEIGHT,
    MIDDLE_VISUALIZATION_HEIGHT_FLEXIBLE_LAYOUT,
    MIN_VISUALIZATION_HEIGHT_FLEXIBLE_LAYOUT,
} from "../constants.js";
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

    protected getDefaultHeight(_settings: ISettings): number {
        // Flexible layout is always enabled now
        return MIDDLE_VISUALIZATION_HEIGHT_FLEXIBLE_LAYOUT;
    }

    protected getMinHeight(_settings: ISettings): number {
        // Flexible layout is always enabled now
        return MIN_VISUALIZATION_HEIGHT_FLEXIBLE_LAYOUT;
    }

    protected getMaxHeight(_settings: ISettings): number {
        // Flexible layout is always enabled now
        return MAX_NEW_VISUALIZATION_HEIGHT;
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
