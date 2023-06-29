// (C) 2019-2023 GoodData Corporation

import {
    AnalyticalWidgetType,
    IDashboardLayoutSize,
    IInsight,
    IInsightDefinition,
    IKpi,
    isDashboardWidget,
    ISettings,
    isInsight,
    isInsightWidget,
    isKpi,
    isKpiWidget,
    isKpiWithoutComparison,
    isWidget,
    IWidget,
    widgetType as getWidgetType,
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

import { ObjRefMap } from "../metadata/objRefMap.js";
import {
    KPI_WITHOUT_COMPARISON_SIZE_INFO,
    KPI_WITH_COMPARISON_SIZE_INFO,
    GRID_ROW_HEIGHT_IN_PX,
} from "./constants.js";
import { ExtendedDashboardWidget } from "../../model/types/layoutTypes.js";

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

/**
 * @internal
 */
export function getInsightPlaceholderSizeInfo(settings: ISettings): IVisualizationSizeInfo {
    return getVisualizationSizeInfo(settings);
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
export function getMinHeight(widgets: IWidget[], insightMap: ObjRefMap<IInsight>, defaultMin = 0): number {
    const mins: number[] = widgets
        .filter(isDashboardWidget)
        .map((widget) =>
            getDashboardLayoutWidgetMinGridHeight(
                { enableKDWidgetCustomHeight: true },
                getWidgetType(widget),
                isKpiWidget(widget) ? widget.kpi : insightMap.get(widget.insight),
            ),
        );
    return Math.max(defaultMin, ...mins);
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
                getWidgetType(widget),
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
        getWidgetType(widget),
        isKpiWidget(widget) ? widget.kpi : insightMap.get(widget.insight),
    );
}

/**
 * @internal
 */
export function calculateWidgetMinHeight(
    widget: ExtendedDashboardWidget,
    currentSize: IDashboardLayoutSize | undefined,
    insightMap: ObjRefMap<IInsight>,
    settings: ISettings,
): number | undefined {
    let widgetType: AnalyticalWidgetType;
    let insight: IInsight;
    let content: IInsight | IKpi;

    if (isWidget(widget)) {
        widgetType = getWidgetType(widget);
    }
    if (isInsightWidget(widget)) {
        insight = insightMap.get(widget.insight)!;
        content = insight;
    }
    if (isKpiWidget(widget)) {
        content = widget.kpi;
    }

    return currentSize
        ? getDashboardLayoutItemHeight(currentSize) ||
              (!currentSize.heightAsRatio
                  ? getDashboardLayoutWidgetDefaultHeight(settings, widgetType!, content!)
                  : undefined)
        : undefined;
}

export const getDashboardLayoutItemHeight = (size: IDashboardLayoutSize): number | undefined => {
    const { gridHeight } = size;
    if (gridHeight) {
        return getDashboardLayoutItemHeightForGrid(gridHeight);
    }

    return undefined;
};

export const getDashboardLayoutItemHeightForGrid = (gridHeight: number): number =>
    gridHeight * GRID_ROW_HEIGHT_IN_PX;
