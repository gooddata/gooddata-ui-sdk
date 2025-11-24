// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { IInsight } from "@gooddata/sdk-model";
import { fillMissingTitles } from "@gooddata/sdk-ui";

import {
    selectCatalogDateDatasets,
    selectEnableComparisonInAlerting,
    selectLocale,
    useDashboardSelector,
} from "../../../model/index.js";
import { getSupportedInsightMeasuresByInsight } from "../DefaultAlertingDialog/utils/items.js";
import { AlertMetric } from "../types.js";

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

    return useMemo(
        () =>
            getSupportedInsightMeasuresByInsight(
                insight ? fillMissingTitles(insight, locale, 9999) : insight,
                catalogDateDatasets,
                canManageComparison,
            ),
        [insight, locale, catalogDateDatasets, canManageComparison],
    );
};
