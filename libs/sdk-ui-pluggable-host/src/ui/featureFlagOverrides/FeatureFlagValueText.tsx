// (C) 2026 GoodData Corporation

import { type IntlShape, useIntl } from "react-intl";

import { type JsonSummary, summarizeJson } from "./overrideRules.js";

const SUMMARY_MESSAGES: Record<JsonSummary["unit"], string> = {
    items: "featureFlagOverrides.value.summary.items",
    keys: "featureFlagOverrides.value.summary.keys",
};

export interface IFeatureFlagValueTextProps {
    value: unknown;
}

export function FeatureFlagValueText({ value }: IFeatureFlagValueTextProps) {
    const intl = useIntl();
    return <>{formatFlagValue(intl, value)}</>;
}

export function formatFlagValue(intl: IntlShape, value: unknown): string {
    if (value === undefined || value === null) {
        return "—";
    }
    if (typeof value === "boolean") {
        return intl.formatMessage({
            id: value ? "featureFlagOverrides.value.on" : "featureFlagOverrides.value.off",
        });
    }
    if (typeof value === "object") {
        const { unit, count } = summarizeJson(value);
        return intl.formatMessage({ id: SUMMARY_MESSAGES[unit] }, { count });
    }
    return String(value);
}
