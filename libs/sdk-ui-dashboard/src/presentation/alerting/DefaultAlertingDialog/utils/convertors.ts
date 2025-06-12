// (C) 2022-2025 GoodData Corporation
import {
    IAlertComparisonOperator,
    IAutomationAlertCondition,
    IAutomationAlertTrigger,
    IAutomationMetadataObjectDefinition,
    IAutomationRecipient,
    IAutomationSchedule,
    IAutomationVisibleFilter,
    IFilter,
} from "@gooddata/sdk-model";

import { AlertMetric } from "../../types.js";

import { getMeasureFormat, getMeasureTitle, IMeasureFormatMap } from "./getters.js";
import { transformAlertExecutionByMetric } from "./transformation.js";

/**
 * @internal
 */
export function createDefaultAlert(
    filters: IFilter[],
    metrics: AlertMetric[],
    measure: AlertMetric,
    notificationChannelId: string,
    currentUser: IAutomationRecipient,
    measureFormatMap: IMeasureFormatMap,
    comparisonOperator: IAlertComparisonOperator = "GREATER_THAN",
    schedule?: IAutomationSchedule,
    visibleWidgetFilters?: IAutomationVisibleFilter[],
    widgetLocalId?: string,
    dashboardId?: string,
    widgetName?: string,
): IAutomationMetadataObjectDefinition {
    const condition: IAutomationAlertCondition = {
        type: "comparison",
        left: {
            id: measure.measure.measure.localIdentifier,
            format: getMeasureFormat(measure.measure, measureFormatMap),
            title: getMeasureTitle(measure.measure),
        },
        operator: comparisonOperator,
        right: undefined!,
    };
    const execution = {
        attributes: [],
        measures: [measure.measure],
        filters,
    };
    const trigger: IAutomationAlertTrigger = {
        state: "ACTIVE",
    };

    return {
        type: "automation",
        title: "",
        notificationChannel: notificationChannelId,
        dashboard: dashboardId,
        alert: {
            trigger,
            condition,
            ...transformAlertExecutionByMetric(
                metrics,
                { alert: { execution, condition, trigger } },
                condition,
                measure,
                undefined,
            ),
        },
        ...(schedule ? { schedule } : {}),
        recipients: [currentUser],
        metadata: {
            widget: widgetLocalId,
            visibleFilters: visibleWidgetFilters,
        },
        details: {
            widgetName: widgetName,
        },
    };
}
