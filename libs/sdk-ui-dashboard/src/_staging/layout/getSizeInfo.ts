// (C) 2019-2022 GoodData Corporation

import {
    AnalyticalWidgetType,
    IInsightDefinition,
    IKpi,
    ISettings,
    isInsight,
    isKpi,
    isKpiWithoutComparison,
} from "@gooddata/sdk-model";
import {
    getInsightSizeInfo,
    INSIGHT_WIDGET_SIZE_INFO_DEFAULT,
    INSIGHT_WIDGET_SIZE_INFO_DEFAULT_LEGACY,
    IVisualizationSizeInfo,
    KPI_WIDGET_SIZE_INFO_DEFAULT,
    KPI_WIDGET_SIZE_INFO_DEFAULT_LEGACY,
} from "@gooddata/sdk-ui-ext";

/**
 * @internal
 */
export type MeasurableWidgetContent = IInsightDefinition | IKpi;

/**
 * @internal
 */
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
