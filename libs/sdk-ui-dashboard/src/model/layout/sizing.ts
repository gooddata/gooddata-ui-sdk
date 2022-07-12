// (C) 2019-2022 GoodData Corporation

import {
    AnalyticalWidgetType,
    IInsight,
    IInsightDefinition,
    IKpi,
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

import { ObjRefMap } from "../../_staging/metadata/objRefMap";

/**
 * @internal
 */
export type MeasurableWidgetContent = IInsightDefinition | IKpi;

export const getSizeInfo = (
    settings: ISettings,
    widgetType: AnalyticalWidgetType,
    widgetContent?: MeasurableWidgetContent,
): IVisualizationSizeInfo => {
    if (widgetType === "kpi") {
        return getKpiSizeInfo(settings, widgetContent);
    }

    return getVisualizationSizeInfo(settings, widgetContent);
};

const getVisualizationSizeInfo = (
    settings: ISettings,
    insight?: MeasurableWidgetContent,
): IVisualizationSizeInfo => {
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
};

const getKpiSizeInfo = (settings: ISettings, kpi?: MeasurableWidgetContent): IVisualizationSizeInfo => {
    if (!settings.enableKDWidgetCustomHeight) {
        return KPI_WIDGET_SIZE_INFO_DEFAULT_LEGACY;
    }
    if (!isKpi(kpi)) {
        return KPI_WIDGET_SIZE_INFO_DEFAULT;
    }
    return {
        width: {
            min: 2,
            default: 2,
        },
        height: isKpiWithoutComparison(kpi)
            ? {
                  default: 8,
                  min: 6,
                  max: 40,
              }
            : {
                  default: 11,
                  min: 10,
                  max: 40,
              },
    };
};

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
    const mins: number[] = widgets.map((widget) =>
        getDashboardLayoutWidgetMinGridHeight(
            { enableKDWidgetCustomHeight: true },
            widgetType(widget),
            isKpiWidget(widget) ? widget.kpi : insightMap.get(widget.insight),
        ),
    );
    return Math.max(...mins);
}

export function getMaxHeight(widgets: IWidget[], insightMap: ObjRefMap<IInsight>): number {
    const maxs: number[] = widgets.map((widget) =>
        getDashboardLayoutWidgetMaxGridHeight(
            { enableKDWidgetCustomHeight: true },
            widgetType(widget),
            isKpiWidget(widget) ? widget.kpi : insightMap.get(widget.insight),
        ),
    );
    return Math.min(...maxs);
}
