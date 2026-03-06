// (C) 2022-2026 GoodData Corporation

import { isEqual } from "lodash-es";

import {
    type IInsight,
    insightFilters,
    insightMeasures,
    measureFilters,
    measureLocalId,
} from "@gooddata/sdk-model";

function getSourceMeasureFilters(insight: IInsight) {
    return insightMeasures(insight)
        .map((measure) => ({
            localIdentifier: measureLocalId(measure),
            filters: measureFilters(measure) ?? [],
        }))
        .sort((left, right) => left.localIdentifier.localeCompare(right.localIdentifier));
}

export function shouldRevalidateDrillsAfterInsightChange(
    originalInsight: IInsight,
    newInsight: IInsight,
): boolean {
    return (
        !isEqual(insightFilters(originalInsight), insightFilters(newInsight)) ||
        !isEqual(getSourceMeasureFilters(originalInsight), getSourceMeasureFilters(newInsight))
    );
}
