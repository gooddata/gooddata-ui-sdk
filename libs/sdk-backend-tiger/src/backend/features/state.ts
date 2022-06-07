// (C) 2020-2022 GoodData Corporation
const FeatureEnabled = "ENABLED";
const FeatureDisabled = "DISABLED";

export function convertState(state?: string): boolean | undefined {
    if (state && state.toLowerCase() === FeatureEnabled.toLowerCase()) {
        return true;
    }
    if (state && state.toLowerCase() === FeatureDisabled.toLowerCase()) {
        return false;
    }
    return undefined;
}
