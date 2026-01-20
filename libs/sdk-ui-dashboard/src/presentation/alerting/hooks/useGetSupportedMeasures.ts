// (C) 2025-2026 GoodData Corporation

import { useEffect, useMemo, useState } from "react";

import { type IInsight } from "@gooddata/sdk-model";
import { fillMissingTitles } from "@gooddata/sdk-ui";

import {
    selectCatalogDateDatasets,
    selectEnableComparisonInAlerting,
    selectLocale,
    useDashboardSelector,
} from "../../../model/index.js";
import { getSupportedInsightMeasuresByInsight } from "../DefaultAlertingDialog/utils/items.js";
import { type AlertMetric } from "../types.js";

/**
 * Hook that calculates supported alertable measures for an insight.
 *
 * @param insight - The insight to check for alertable measures
 * @returns Array of supported measures that can be used for alerting
 * @internal
 */
export const useGetSupportedMeasures = (insight: IInsight | undefined): AlertMetric[] => {
    const catalogDateDatasets = useDashboardSelector(selectCatalogDateDatasets);
    const canManageComparison = useDashboardSelector(selectEnableComparisonInAlerting);
    const locale = useDashboardSelector(selectLocale);
    const [effectiveInsight, setEffectiveInsight] = useState<IInsight | undefined>(undefined);
    useEffect(() => {
        if (insight) {
            void fillMissingTitles(insight, locale, 9999).then(setEffectiveInsight);
        }
    }, [insight, locale]);
    return useMemo(
        () =>
            getSupportedInsightMeasuresByInsight(effectiveInsight, catalogDateDatasets, canManageComparison),
        [effectiveInsight, catalogDateDatasets, canManageComparison],
    );
};
