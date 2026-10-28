// (C) 2020-2026 GoodData Corporation

import {
    type ITigerFeatureFlags,
    LocalFeatureFlagOverrides,
    TigerFeatureDefinitions,
} from "../uiFeatures.js";

import { convertState } from "./state.js";

export type FeatureDef = {
    id: string;
    key: string;
    l: boolean;
    version: string;
    type: "BOOLEAN" | "STRING" | "NUMBER" | "JSON";
    value: any;
};

export type FeaturesMap = Record<string, FeatureDef>;

export function mapFeatures(features: FeaturesMap): Partial<ITigerFeatureFlags> {
    const result: Partial<ITigerFeatureFlags> = { ...LocalFeatureFlagOverrides };
    for (const [name, definition] of Object.entries(TigerFeatureDefinitions)) {
        if (Object.hasOwn(LocalFeatureFlagOverrides, name)) continue;
        const item = features[name];
        if (!item) continue;
        const value = getValueByType(item.type, item.value, definition.type);
        if (value !== undefined) Object.assign(result, { [name]: value });
    }
    return result;
}

function getValueByType(
    inputType: FeatureDef["type"],
    value: FeatureDef["value"],
    outputType: "STRING" | "BOOLEAN" | "JSON" | "NUMBER",
) {
    switch (inputType) {
        case "BOOLEAN":
            if (value !== undefined) {
                return value;
            }
            break;
        case "NUMBER":
        case "STRING": {
            const possibleValues = outputType === "BOOLEAN" ? [true, false] : [];
            const state = convertState(outputType, possibleValues, value);
            if (state !== undefined) {
                return state;
            }
            break;
        }
        case "JSON": {
            if (value !== undefined) {
                return JSON.parse(value);
            }
            break;
        }
        default:
            break;
    }
    return undefined;
}
