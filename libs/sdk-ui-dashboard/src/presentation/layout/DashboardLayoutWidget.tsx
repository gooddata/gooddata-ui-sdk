// (C) 2020 GoodData Corporation
import React from "react";
import {
    IWidget,
    isWidget,
    UnexpectedError,
    ILegacyKpi,
    isDashboardLayout,
    isInsightWidget,
    widgetType as getWidgetType,
    AnalyticalWidgetType,
    isKpiWidget,
    IDashboardWidget,
} from "@gooddata/sdk-backend-spi";
import { ObjRef, IInsight, areObjRefsEqual } from "@gooddata/sdk-model";
import { selectInsights, selectSettings, useDashboardSelector } from "../../model";
import { DashboardWidgetPropsProvider, DashboardWidget, DashboardWidgetProps } from "../widget";
import {
    getDashboardLayoutItemHeight,
    getDashboardLayoutItemHeightForRatioAndScreen,
    getDashboardLayoutWidgetDefaultHeight,
    IDashboardLayoutWidgetRenderer,
} from "./DefaultDashboardLayoutRenderer";

/**
 * @internal
 */
export const DashboardLayoutWidget: IDashboardLayoutWidgetRenderer<
    IDashboardWidget,
    Pick<DashboardWidgetProps, "onError" | "onDrill" | "onFiltersChange">
> = (props) => {
    const { item, screen, DefaultWidgetRenderer, onDrill, onFiltersChange, onError } = props;
    const insights = useDashboardSelector(selectInsights);
    const settings = useDashboardSelector(selectSettings);

    const getInsightByRef = (insightRef: ObjRef): IInsight | undefined => {
        return insights.find((i) => areObjRefsEqual(i.insight.ref, insightRef));
    };

    let widgetType: AnalyticalWidgetType;
    let insight: IInsight;
    let content: IInsight | ILegacyKpi;
    const widget = item.widget();
    if (isDashboardLayout(widget)) {
        throw new UnexpectedError("Nested layouts not yet supported.");
    }

    if (isWidget(widget)) {
        widgetType = getWidgetType(widget);
    }
    if (isInsightWidget(widget)) {
        insight = getInsightByRef(widget.insight)!;
        content = insight;
    }
    if (isKpiWidget(widget)) {
        content = widget.kpi;
    }

    const currentSize = item.size()[screen]!;

    const minHeight =
        getDashboardLayoutItemHeight(currentSize) ||
        (!currentSize.heightAsRatio
            ? getDashboardLayoutWidgetDefaultHeight(settings, widgetType!, content!)
            : undefined);
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
            <DashboardWidgetPropsProvider
                screen={screen}
                onDrill={onDrill}
                onError={onError}
                onFiltersChange={onFiltersChange}
                widget={widget as IWidget}
            >
                <DashboardWidget />
            </DashboardWidgetPropsProvider>
        </DefaultWidgetRenderer>
    );
};
