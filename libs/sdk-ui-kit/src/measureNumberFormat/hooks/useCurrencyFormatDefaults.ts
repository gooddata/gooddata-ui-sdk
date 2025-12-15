// (C) 2025 GoodData Corporation

import { useEffect } from "react";

import type { MetricType } from "@gooddata/sdk-model";

const DEFAULT_CURRENCY_FORMAT = "$#,##0.00";

/** @internal */
export interface UseCurrencyFormatDefaultsConfig {
    metricType?: MetricType;
    currencyFormatOverride?: string | null;
    onFormatChange: (format: string | null) => void;
    shouldBootstrap: boolean;
    fallbackFormat?: string;
}

/**
 * @internal
 *
 * Bootstraps a default format for currency metrics when no format is set.
 * - When no format is set yet (`shouldBootstrap` is true), it applies the inherited override
 *   or the standard currency preset.
 * - Custom formats are always preserved and never coerced.
 */
export function useCurrencyFormatDefaults({
    metricType,
    currencyFormatOverride,
    onFormatChange,
    shouldBootstrap,
    fallbackFormat = DEFAULT_CURRENCY_FORMAT,
}: UseCurrencyFormatDefaultsConfig) {
    useEffect(() => {
        if (metricType !== "CURRENCY" || !shouldBootstrap) {
            return;
        }

        onFormatChange(resolveDefaultFormat(currencyFormatOverride, fallbackFormat));
    }, [currencyFormatOverride, fallbackFormat, metricType, onFormatChange, shouldBootstrap]);
}

function resolveDefaultFormat(currencyFormatOverride: string | null | undefined, fallbackFormat: string) {
    return currencyFormatOverride ? null : fallbackFormat;
}
