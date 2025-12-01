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

import { IMeasureFormatMap, getMeasureFormat, getMeasureTitle } from "./getters.js";
import { transformAlertExecutionByMetric } from "./transformation.js";
import { AlertMetric } from "../../types.js";

/**
 * @internal
 */
export function createDefaultAlert(
    filters: IFilter[],
    metrics: AlertMetric[],
    measure: AlertMetric | undefined,
    notificationChannelId: string,
    currentUser: IAutomationRecipient,
    measureFormatMap: IMeasureFormatMap,
    comparisonOperator: IAlertComparisonOperator = "GREATER_THAN",
    schedule?: IAutomationSchedule,
    visibleWidgetFilters?: IAutomationVisibleFilter[],
    widgetLocalId?: string,
    dashboardId?: string,
    widgetName?: string,
    targetTabIdentifier?: string,
): IAutomationMetadataObjectDefinition | undefined {
    if (!measure) {
        return undefined;
    }

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
        dashboard: dashboardId ? { id: dashboardId } : undefined,
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
            ...(targetTabIdentifier ? { targetTabIdentifier } : {}),
        },
        details: {
            widgetName: widgetName,
        },
    };
}
