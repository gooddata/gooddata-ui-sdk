// (C) 2019-2024 GoodData Corporation

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
    isVisualizationSwitcherWidget,
    IVisualizationSwitcherWidget,
} from "@gooddata/sdk-model";
import {
    fluidLayoutDescriptor,
    getInsightSizeInfo,
    INSIGHT_WIDGET_SIZE_INFO_DEFAULT,
    INSIGHT_WIDGET_SIZE_INFO_DEFAULT_LEGACY,
    INSIGHT_WIDGET_SIZE_INFO_NEW_DEFAULT,
    IVisualizationSizeInfo,
    KPI_WIDGET_SIZE_INFO_DEFAULT,
    KPI_WIDGET_SIZE_INFO_DEFAULT_LEGACY,
    RICH_TEXT_WIDGET_SIZE_INFO_DEFAULT,
    VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_DEFAULT,
    RICH_TEXT_WIDGET_SIZE_INFO_NEW_DEFAULT,
    VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_NEW_DEFAULT,
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
    } else if (widgetType === "richText") {
        return settings.enableDashboardFlexibleLayout
            ? RICH_TEXT_WIDGET_SIZE_INFO_NEW_DEFAULT
            : RICH_TEXT_WIDGET_SIZE_INFO_DEFAULT;
    } else if (widgetType === "visualizationSwitcher" && !widgetContent) {
        return settings.enableDashboardFlexibleLayout
            ? VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_NEW_DEFAULT
            : VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_DEFAULT;
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
        return settings.enableDashboardFlexibleLayout
            ? INSIGHT_WIDGET_SIZE_INFO_NEW_DEFAULT
            : INSIGHT_WIDGET_SIZE_INFO_DEFAULT;
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
    const mins: number[] = widgets.filter(isDashboardWidget).map((widget) => {
        let widgetContent: MeasurableWidgetContent | undefined;
        if (isKpiWidget(widget)) {
            widgetContent = widget.kpi;
        } else if (isInsightWidget(widget)) {
            widgetContent = insightMap.get(widget.insight);
        } else if (isVisualizationSwitcherWidget(widget) && widget.visualizations.length > 0) {
            return Math.max(
                ...getVisSwitcherHeightWidth(
                    widget,
                    widgetContent,
                    insightMap,
                    getDashboardLayoutWidgetMinGridHeight,
                ),
            );
        }

        return getDashboardLayoutWidgetMinGridHeight(
            { enableKDWidgetCustomHeight: true },
            getWidgetType(widget),
            widgetContent,
        );
    });
    return Math.max(defaultMin, ...mins);
}

/**
 * @internal
 */
export function getMaxHeight(widgets: IWidget[], insightMap: ObjRefMap<IInsight>): number {
    const maxs: number[] = widgets.filter(isDashboardWidget).map((widget) => {
        let widgetContent: MeasurableWidgetContent | undefined;
        if (isKpiWidget(widget)) {
            widgetContent = widget.kpi;
        } else if (isInsightWidget(widget)) {
            widgetContent = insightMap.get(widget.insight);
        } else if (isVisualizationSwitcherWidget(widget) && widget.visualizations.length > 0) {
            return Math.min(
                ...getVisSwitcherHeightWidth(
                    widget,
                    widgetContent,
                    insightMap,
                    getDashboardLayoutWidgetMaxGridHeight,
                ),
            );
        }

        return getDashboardLayoutWidgetMaxGridHeight(
            { enableKDWidgetCustomHeight: true },
            getWidgetType(widget),
            widgetContent,
        );
    });
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

type DashboardLayoutWidgetGridWidthHeight = (
    settings: ISettings,
    widgetType: AnalyticalWidgetType,
    widgetContent?: MeasurableWidgetContent,
) => number;

function getVisSwitcherHeightWidth(
    widget: IVisualizationSwitcherWidget,
    widgetContent: MeasurableWidgetContent | undefined,
    insightMap: ObjRefMap<IInsight>,
    fn: DashboardLayoutWidgetGridWidthHeight,
): number[] {
    const result: number[] = [];
    widget.visualizations.forEach((visualization) => {
        widgetContent = insightMap.get(visualization.insight);

        const heightWidth = fn({ enableKDWidgetCustomHeight: true }, getWidgetType(widget), widgetContent);

        result.push(heightWidth);
    });

    return result;
}
/**
 * @internal
 */
export function getMinWidth(widget: IWidget, insightMap: ObjRefMap<IInsight>): number {
    let widgetContent: MeasurableWidgetContent | undefined;
    if (isKpiWidget(widget)) {
        widgetContent = widget.kpi;
    } else if (isInsightWidget(widget)) {
        widgetContent = insightMap.get(widget.insight);
    } else if (isVisualizationSwitcherWidget(widget) && widget.visualizations.length > 0) {
        return Math.max(
            ...getVisSwitcherHeightWidth(
                widget,
                widgetContent,
                insightMap,
                getDashboardLayoutWidgetMinGridWidth,
            ),
        );
    }

    return getDashboardLayoutWidgetMinGridWidth(
        { enableKDWidgetCustomHeight: true },
        getWidgetType(widget),
        widgetContent,
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
