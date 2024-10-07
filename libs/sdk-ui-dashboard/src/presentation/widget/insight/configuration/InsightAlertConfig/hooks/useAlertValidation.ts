// (C) 2024 GoodData Corporation

import {
    selectInsightByWidgetRef,
    selectWidgetByRef,
    useDashboardSelector,
} from "../../../../../../model/index.js";
import { getAlertMeasure, getSupportedInsightMeasuresByInsight } from "../utils.js";
import { IAutomationMetadataObject } from "@gooddata/sdk-model";

export type AlertInvalidityReason = "missingMetric" | "missingWidget";

export const useAlertValidation = (
    alert: IAutomationMetadataObject,
    isNewAlert?: boolean,
): { isValid: boolean; invalidityReason: AlertInvalidityReason | undefined } => {
    const widgetLocalId = alert.metadata?.widget;
    const widgetRef = widgetLocalId ? { identifier: widgetLocalId } : undefined;

    const widget = useDashboardSelector(selectWidgetByRef(widgetRef));
    const insight = useDashboardSelector(selectInsightByWidgetRef(widget?.ref));
    const supportedMeasures = getSupportedInsightMeasuresByInsight(insight);
    const selectedMeasureExists = getAlertMeasure(supportedMeasures, alert.alert);

    const isValid = isNewAlert || Boolean(!!widget && selectedMeasureExists);

    let invalidityReason: AlertInvalidityReason | undefined = undefined;
    if (!widget) {
        invalidityReason = "missingWidget";
    } else if (!selectedMeasureExists) {
        invalidityReason = "missingMetric";
    }

    return {
        isValid,
        invalidityReason,
    };
};
