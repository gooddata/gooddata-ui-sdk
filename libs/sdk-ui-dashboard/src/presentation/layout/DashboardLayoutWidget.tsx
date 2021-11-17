// (C) 2020 GoodData Corporation
import React from "react";
import {
    isWidget,
    ILegacyKpi,
    isInsightWidget,
    widgetType as getWidgetType,
    AnalyticalWidgetType,
    isKpiWidget,
    ISettings,
    IDashboardLayoutSize,
} from "@gooddata/sdk-backend-spi";
import { IInsight } from "@gooddata/sdk-model";
import {
    ExtendedDashboardWidget,
    selectInsightsMap,
    selectSettings,
    useDashboardSelector,
} from "../../model";
import { DashboardWidget, IDashboardWidgetProps } from "../widget";
import {
    getDashboardLayoutItemHeight,
    getDashboardLayoutItemHeightForRatioAndScreen,
    getDashboardLayoutWidgetDefaultHeight,
    IDashboardLayoutWidgetRenderer,
} from "./DefaultDashboardLayoutRenderer";
import { ObjRefMap } from "../../_staging/metadata/objRefMap";

function calculateWidgetMinHeight(
    widget: ExtendedDashboardWidget,
    currentSize: IDashboardLayoutSize,
    insights: ObjRefMap<IInsight>,
    settings: ISettings,
): number | undefined {
    let widgetType: AnalyticalWidgetType;
    let insight: IInsight;
    let content: IInsight | ILegacyKpi;

    if (isWidget(widget)) {
        widgetType = getWidgetType(widget);
    }
    if (isInsightWidget(widget)) {
        insight = insights.get(widget.insight)!;
        content = insight;
    }
    if (isKpiWidget(widget)) {
        content = widget.kpi;
    }

    return (
        getDashboardLayoutItemHeight(currentSize) ||
        (!currentSize.heightAsRatio
            ? getDashboardLayoutWidgetDefaultHeight(settings, widgetType!, content!)
            : undefined)
    );
}

/**
 * @internal
 */
export const DashboardLayoutWidget: IDashboardLayoutWidgetRenderer<
    ExtendedDashboardWidget,
    Pick<IDashboardWidgetProps, "onError" | "onDrill" | "onFiltersChange">
> = (props) => {
    const { item, screen, DefaultWidgetRenderer, onDrill, onFiltersChange, onError } = props;
    const insights = useDashboardSelector(selectInsightsMap);
    const settings = useDashboardSelector(selectSettings);
    // TODO: we should probably do something more meaningful when item has no widget; should that even
    //  be allowed? undefined widget will make things explode down the line away so..
    const widget = item.widget()!;
    const currentSize = item.size()[screen]!;
    const minHeight = calculateWidgetMinHeight(widget, currentSize, insights, settings);
    const height =
        currentSize.heightAsRatio && !currentSize.gridHeight
            ? getDashboardLayoutItemHeightForRatioAndScreen(currentSize, screen)
            : undefined;

    const allowOverflow = !!currentSize.heightAsRatio;
    const className = settings.enableKDWidgetCustomHeight ? "custom-height" : undefined;

    return (
        <DefaultWidgetRenderer
            DefaultWidgetRenderer={DefaultWidgetRenderer}
            item={item}
            screen={screen}
            allowOverflow={allowOverflow}
            height={height}
            minHeight={minHeight}
            className={className}
        >
            <DashboardWidget
                screen={screen}
                onDrill={onDrill}
                onError={onError}
                onFiltersChange={onFiltersChange}
                widget={widget as ExtendedDashboardWidget}
            />
        </DefaultWidgetRenderer>
    );
};
