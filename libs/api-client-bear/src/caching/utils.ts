// (C) 2023 GoodData Corporation
export function cachingEnabled(settingValue: boolean | number | undefined): boolean {
    return settingValue !== undefined && !!settingValue;
}
