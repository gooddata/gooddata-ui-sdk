// (C) 2021-2025 GoodData Corporation

import { IInsight, IInsightDefinition, ISettings } from "@gooddata/sdk-model";

import { IFluidLayoutDescriptor } from "../../../interfaces/LayoutDescriptor.js";
import { IDrillDownContext } from "../../../interfaces/Visualization.js";
import {
    IVisualizationDescriptor,
    IVisualizationMeta,
    IVisualizationSizeInfo,
    PluggableVisualizationFactory,
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
