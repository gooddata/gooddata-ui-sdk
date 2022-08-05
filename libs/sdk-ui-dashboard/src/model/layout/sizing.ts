// (C) 2019-2022 GoodData Corporation

import {
    AnalyticalWidgetType,
    IInsight,
    isDashboardWidget,
    ISettings,
    isKpiWidget,
    IWidget,
    widgetType,
} from "@gooddata/sdk-model";
import { fluidLayoutDescriptor } from "@gooddata/sdk-ui-ext";

import { getSizeInfo, MeasurableWidgetContent } from "../../_staging/layout/getSizeInfo";
import { ObjRefMap } from "../../_staging/metadata/objRefMap";

export function getDashboardLayoutWidgetDefaultHeight(
    settings: ISettings,
    widgetType: AnalyticalWidgetType,
    widgetContent?: MeasurableWidgetContent, // undefined for placeholders
): number {
    const sizeInfo = getSizeInfo(settings, widgetType, widgetContent);
    return fluidLayoutDescriptor.toHeightInPx(sizeInfo.height.default!);
}

export function getDashboardLayoutWidgetMinGridHeight(
    settings: ISettings,
    widgetType: AnalyticalWidgetType,
    widgetContent?: MeasurableWidgetContent,
): number {
    const sizeInfo = getSizeInfo(settings, widgetType, widgetContent);
    return sizeInfo.height.min!;
}

export function getDashboardLayoutWidgetMaxGridHeight(
    settings: ISettings,
    widgetType: AnalyticalWidgetType,
    widgetContent?: MeasurableWidgetContent,
): number {
    const sizeInfo = getSizeInfo(settings, widgetType, widgetContent);
    return sizeInfo.height.max!;
}

export function getMinHeight(widgets: IWidget[], insightMap: ObjRefMap<IInsight>): number {
    const mins: number[] = widgets
        .filter(isDashboardWidget)
        .map((widget) =>
            getDashboardLayoutWidgetMinGridHeight(
                { enableKDWidgetCustomHeight: true },
                widgetType(widget),
                isKpiWidget(widget) ? widget.kpi : insightMap.get(widget.insight),
            ),
        );
    return Math.max(...mins);
}

export function getMaxHeight(widgets: IWidget[], insightMap: ObjRefMap<IInsight>): number {
    const maxs: number[] = widgets
        .filter(isDashboardWidget)
        .map((widget) =>
            getDashboardLayoutWidgetMaxGridHeight(
                { enableKDWidgetCustomHeight: true },
                widgetType(widget),
                isKpiWidget(widget) ? widget.kpi : insightMap.get(widget.insight),
            ),
        );
    return Math.min(...maxs);
}

export function getDashboardLayoutWidgetMinGridWidth(
    settings: ISettings,
    widgetType: AnalyticalWidgetType,
    widgetContent?: MeasurableWidgetContent, // undefined for placeholders
): number {
    const sizeInfo = getSizeInfo(settings, widgetType, widgetContent);
    return sizeInfo.width.min!;
}

export function getMinWidth(widget: IWidget, insightMap: ObjRefMap<IInsight>): number {
    return getDashboardLayoutWidgetMinGridWidth(
        { enableKDWidgetCustomHeight: true },
        widgetType(widget),
        isKpiWidget(widget) ? widget.kpi : insightMap.get(widget.insight),
    );
}
