// (C) 2026 GoodData Corporation

import type { IFeatureHubFeature } from "./types.js";

/**
 * @internal
 * Merge `overrides` into `features`: an override whose `key` already exists in `features` replaces that
 * feature in place, any other override is appended at the end. Neither input is mutated.
 */
export function mergeFeatureHubFeatures(
    features: IFeatureHubFeature[],
    overrides: IFeatureHubFeature[],
): IFeatureHubFeature[] {
    const merged = [...features];

    for (const override of overrides) {
        const index = merged.findIndex((feature) => feature.key === override.key);

        if (index === -1) {
            merged.push(override);
        } else {
            merged[index] = override;
        }
    }

    return merged;
}
