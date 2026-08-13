// (C) 2025-2026 GoodData Corporation

import {
    type DateAttributeGranularity,
    getKdaSupportedGranularities,
    getKdaSupportedStringGranularities,
} from "@gooddata/sdk-model";

/**
 * Returns KDA-supported date granularities, including second when the feature flag is on.
 *
 * @internal
 */
export function getKeyDriverAnalysisSupportedGranularities(
    enableSecondGranularities = false,
): DateAttributeGranularity[] {
    return getKdaSupportedGranularities(enableSecondGranularities);
}

/**
 * Returns KDA-supported string granularities, including second when the feature flag is on.
 *
 * @internal
 */
export function getKeyDriverAnalysisSupportedStringGranularities(
    enableSecondGranularities = false,
): string[] {
    return getKdaSupportedStringGranularities(enableSecondGranularities);
}
