// (C) 2019-2022 GoodData Corporation

import {
    AnalyticalWidgetType,
    IInsight,
    IInsightDefinition,
    IKpi,
    isDashboardWidget,
    ISettings,
    isInsight,
    isKpi,
    isKpiWidget,
    isKpiWithoutComparison,
    IWidget,
    widgetType,
} from "@gooddata/sdk-model";
import {
    fluidLayoutDescriptor,
    getInsightSizeInfo,
    INSIGHT_WIDGET_SIZE_INFO_DEFAULT,
    INSIGHT_WIDGET_SIZE_INFO_DEFAULT_LEGACY,
    IVisualizationSizeInfo,
    KPI_WIDGET_SIZE_INFO_DEFAULT,
    KPI_WIDGET_SIZE_INFO_DEFAULT_LEGACY,
} from "@gooddata/sdk-ui-ext";

import { ObjRefMap } from "../metadata/objRefMap";
import { KPI_WITHOUT_COMPARISON_SIZE_INFO, KPI_WITH_COMPARISON_SIZE_INFO } from "./constants";

/**
 * @internal
 */
export type MeasurableWidgetContent = IInsightDefinition | IKpi;

/**
 * @internal
 */
export function getSizeInfo(
    settings: ISettings,
    widgetType: AnalyticalWidgetType,
    widgetContent?: MeasurableWidgetContent,
): IVisualizationSizeInfo {
    if (widgetType === "kpi") {
        return getKpiSizeInfo(settings, widgetContent);
    }

    return getVisualizationSizeInfo(settings, widgetContent);
}

function getVisualizationSizeInfo(
    settings: ISettings,
    insight?: MeasurableWidgetContent,
): IVisualizationSizeInfo {
    let sizeInfo;
    if (isInsight(insight)) {
        sizeInfo = getInsightSizeInfo(insight, settings);
    }

    if (!sizeInfo) {
        if (!settings.enableKDWidgetCustomHeight) {
            return INSIGHT_WIDGET_SIZE_INFO_DEFAULT_LEGACY;
        }
        return INSIGHT_WIDGET_SIZE_INFO_DEFAULT;
    }
    return sizeInfo;
}

function getKpiSizeInfo(settings: ISettings, kpi?: MeasurableWidgetContent): IVisualizationSizeInfo {
    if (!settings.enableKDWidgetCustomHeight) {
        return KPI_WIDGET_SIZE_INFO_DEFAULT_LEGACY;
    }
    if (!isKpi(kpi)) {
        return KPI_WIDGET_SIZE_INFO_DEFAULT;
    }
    return isKpiWithoutComparison(kpi) ? KPI_WITHOUT_COMPARISON_SIZE_INFO : KPI_WITH_COMPARISON_SIZE_INFO;
}

/**
 * @internal
 */
export function getDashboardLayoutWidgetDefaultHeight(
    settings: ISettings,
    widgetType: AnalyticalWidgetType,
    widgetContent?: MeasurableWidgetContent, // undefined for placeholders
): number {
    const sizeInfo = getSizeInfo(settings, widgetType, widgetContent);
    return fluidLayoutDescriptor.toHeightInPx(sizeInfo.height.default!);
}

/**
 * @internal
 */
export function getDashboardLayoutWidgetMinGridHeight(
    settings: ISettings,
    widgetType: AnalyticalWidgetType,
    widgetContent?: MeasurableWidgetContent,
): number {
    const sizeInfo = getSizeInfo(settings, widgetType, widgetContent);
    return sizeInfo.height.min!;
}

/**
 * @internal
 */
export function getDashboardLayoutWidgetMaxGridHeight(
    settings: ISettings,
    widgetType: AnalyticalWidgetType,
    widgetContent?: MeasurableWidgetContent,
): number {
    const sizeInfo = getSizeInfo(settings, widgetType, widgetContent);
    return sizeInfo.height.max!;
}

/**
 * @internal
 */
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

/**
 * @internal
 */
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

/**
 * @internal
 */
export function getDashboardLayoutWidgetMinGridWidth(
    settings: ISettings,
    widgetType: AnalyticalWidgetType,
    widgetContent?: MeasurableWidgetContent, // undefined for placeholders
): number {
    const sizeInfo = getSizeInfo(settings, widgetType, widgetContent);
    return sizeInfo.width.min!;
}

/**
 * @internal
 */
export function getMinWidth(widget: IWidget, insightMap: ObjRefMap<IInsight>): number {
    return getDashboardLayoutWidgetMinGridWidth(
        { enableKDWidgetCustomHeight: true },
        widgetType(widget),
        isKpiWidget(widget) ? widget.kpi : insightMap.get(widget.insight),
    );
}
