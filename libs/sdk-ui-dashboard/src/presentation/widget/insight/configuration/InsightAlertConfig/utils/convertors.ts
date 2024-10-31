// (C) 2022-2024 GoodData Corporation
import {
    IAlertComparisonOperator,
    IAutomationAlertCondition,
    IAutomationMetadataObjectDefinition,
    IAutomationRecipient,
    ICatalogMeasure,
    IFilter,
} from "@gooddata/sdk-model";

import { AlertMetric } from "../../../types.js";

import { getMeasureFormat, getMeasureTitle } from "./getters.js";
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
    catalogMeasures: ICatalogMeasure[] = [],
    comparisonOperator: IAlertComparisonOperator = "GREATER_THAN",
): IAutomationMetadataObjectDefinition {
    const condition: IAutomationAlertCondition = {
        type: "comparison",
        left: {
            id: measure.measure.measure.localIdentifier,
            format: getMeasureFormat(measure.measure, catalogMeasures),
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

    return {
        type: "automation",
        title: getMeasureTitle(measure.measure),
        notificationChannel: notificationChannelId,
        alert: {
            condition,
            execution: {
                ...execution,
                ...transformAlertExecutionByMetric(
                    metrics,
                    condition,
                    {
                        attributes: [],
                        measures: [measure.measure],
                        filters,
                    },
                    measure,
                ),
            },
            trigger: {
                state: "ACTIVE",
            },
        },
        recipients: [currentUser],
    };
}
