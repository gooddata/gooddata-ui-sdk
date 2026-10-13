// (C) 2026 GoodData Corporation

import { v4 as uuidv4 } from "uuid";

import { type FeatureHubFeatureValue, type IFeatureHubFeature } from "../feature-hub/types.js";

import { type FeatureFlagValue, type FeatureFlags } from "./types.js";

export function flagToFeature(key: string, flagValue: FeatureFlagValue): IFeatureHubFeature {
    const flagValueType: string = typeof flagValue;

    let valueType: string;
    let value: FeatureHubFeatureValue;
    if (flagValueType === "object") {
        value = JSON.stringify(flagValue);
        valueType = "JSON";
    } else {
        value = flagValue as FeatureHubFeatureValue;
        valueType = flagValueType.toUpperCase();
    }

    return {
        id: uuidv4(),
        key,
        l: false,
        version: 1,
        type: valueType,
        value,
    };
}

/** Convert a `featureFlags` record from test details into FeatureHub features. */
export function flagsToFeatures(flags: FeatureFlags): IFeatureHubFeature[] {
    return Object.entries(flags).map(([key, value]) => flagToFeature(key, value));
}
