// (C) 2025 GoodData Corporation

import { IInsight, IInsightDefinition, ISettings, insightSanitize } from "@gooddata/sdk-model";

import { PluggablePivotTableNext } from "./PluggablePivotTableNext.js";
import { IFluidLayoutDescriptor } from "../../../interfaces/LayoutDescriptor.js";
import { IDrillDownContext } from "../../../interfaces/Visualization.js";
import {
    IVisualizationDescriptor,
    IVisualizationMeta,
    IVisualizationSizeInfo,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor.js";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor.js";
import {
    DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT,
    MIN_VISUALIZATION_HEIGHT,
    MIN_VISUALIZATION_HEIGHT_FLEXIBLE_LAYOUT,
} from "../constants.js";
import {
    addIntersectionFiltersToInsight,
    modifyBucketsAttributesForDrillDown,
    sanitizeTableProperties,
} from "../drillDownUtil.js";

export class PivotTableNextDescriptor extends BaseChartDescriptor implements IVisualizationDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggablePivotTableNext(params);
    }

    public getSizeInfo(
        _insight: IInsightDefinition,
        layoutDescriptor: IFluidLayoutDescriptor,
        settings: ISettings,
    ): IVisualizationSizeInfo {
        return {
            width: {
                default: settings.enableDashboardFlexibleLayout ? 4 : layoutDescriptor.gridColumnsCount,
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
        return MIN_VISUALIZATION_HEIGHT;
    }

    public applyDrillDown(
        insight: IInsight,
        drillDownContext: IDrillDownContext,
        backendSupportsElementUris: boolean,
        enableDuplicatedLabelValuesInAttributeFilter: boolean,
    ): IInsight {
        const drillDownInsight = modifyBucketsAttributesForDrillDown(
            insight,
            drillDownContext.drillDefinition,
        );
        const drillDownInsightWithFilters = addIntersectionFiltersToInsight(
            drillDownInsight,
            drillDownContext.event.drillContext.intersection,
            backendSupportsElementUris,
            enableDuplicatedLabelValuesInAttributeFilter,
        );
        return sanitizeTableProperties(insightSanitize(drillDownInsightWithFilters));
    }

    public getMeta(): IVisualizationMeta {
        return {
            documentationUrl: "https://sdk.gooddata.com/gooddata-ui/docs/pivot_table_component.html", // TODO: update link
            supportsExport: true,
            supportsZooming: false,
        };
    }
}
