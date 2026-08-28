// (C) 2024-2026 GoodData Corporation

import type { IAutomationMetadataObject, ICatalogDateDataset, IInsight, IWidget } from "@gooddata/sdk-model";

import { getAlertMeasure } from "../utils/getters.js";
import { getSupportedInsightMeasuresByInsight } from "../utils/items.js";

export type AlertInvalidityReason = "missingMetric" | "missingWidget";

export function useAlertValidation(
    alert: IAutomationMetadataObject | undefined,
    widget: IWidget | undefined,
    insight: IInsight | undefined,
    catalogDateDatasets: ICatalogDateDataset[],
    isNewAlert?: boolean,
): { isValid: boolean; invalidityReason: AlertInvalidityReason | undefined } {
    const supportedMeasures = getSupportedInsightMeasuresByInsight(insight, catalogDateDatasets, alert);
    const selectedMeasureExists = alert ? getAlertMeasure(supportedMeasures, alert.alert) : undefined;

    const isValid = isNewAlert || Boolean(!!widget && selectedMeasureExists);

    let invalidityReason: AlertInvalidityReason | undefined = undefined;
    if (!widget) {
        invalidityReason = "missingWidget";
    } else if (!selectedMeasureExists) {
        invalidityReason = "missingMetric";
    }

    return { isValid, invalidityReason };
}
