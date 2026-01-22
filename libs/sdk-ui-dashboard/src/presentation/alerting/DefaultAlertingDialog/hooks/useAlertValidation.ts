// (C) 2024-2026 GoodData Corporation

import { type IAutomationMetadataObject } from "@gooddata/sdk-model";

import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { selectCatalogDateDatasets } from "../../../../model/store/catalog/catalogSelectors.js";
import { selectInsightByWidgetRef } from "../../../../model/store/insights/insightsSelectors.js";
import { selectWidgetByRef } from "../../../../model/store/tabs/layout/layoutSelectors.js";
import { getAlertMeasure } from "../utils/getters.js";
import { getSupportedInsightMeasuresByInsight } from "../utils/items.js";

export type AlertInvalidityReason = "missingMetric" | "missingWidget";

export const useAlertValidation = (
    alert: IAutomationMetadataObject | undefined,
    isNewAlert?: boolean,
): { isValid: boolean; invalidityReason: AlertInvalidityReason | undefined } => {
    const widgetLocalId = alert?.metadata?.widget;
    const widgetRef = widgetLocalId ? { identifier: widgetLocalId } : undefined;

    const widget = useDashboardSelector(selectWidgetByRef(widgetRef));
    const insight = useDashboardSelector(selectInsightByWidgetRef(widget?.ref));
    const dateDatasets = useDashboardSelector(selectCatalogDateDatasets);
    const supportedMeasures = getSupportedInsightMeasuresByInsight(insight, dateDatasets);
    const selectedMeasureExists = alert ? getAlertMeasure(supportedMeasures, alert.alert) : undefined;

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
