// (C) 2025 GoodData Corporation

import { useEffect, useRef } from "react";

import type { MetricType } from "@gooddata/sdk-model";

const DEFAULT_CURRENCY_FORMAT = "$#,##0.00";

/** @internal */
export interface UseCurrencyFormatDefaultsConfig {
    metricType?: MetricType;
    normalizedFormat: string | null;
    currencyFormatOverride?: string | null;
    presetFormats: string[];
    hasInheritPreset: boolean;
    onFormatChange: (format: string | null) => void;
    shouldBootstrap: boolean;
    fallbackFormat?: string;
}

/**
 * @internal
 *
 * Ensures that currency metrics default to a meaningful preset instead of falling back to custom formats.
 * - When no format is set yet, it applies the inherited override or the standard currency preset.
 * - When switching to currency with an incompatible format, it coerces the format to a supported preset.
 */
export function useCurrencyFormatDefaults({
    metricType,
    normalizedFormat,
    currencyFormatOverride,
    presetFormats,
    hasInheritPreset,
    onFormatChange,
    shouldBootstrap,
    fallbackFormat = DEFAULT_CURRENCY_FORMAT,
}: UseCurrencyFormatDefaultsConfig) {
    const previousMetricType = usePreviousMetricType(metricType);

    useEffect(() => {
        if (metricType !== "CURRENCY" || !shouldBootstrap) {
            return;
        }

        onFormatChange(resolveDefaultFormat(currencyFormatOverride, fallbackFormat));
    }, [currencyFormatOverride, fallbackFormat, metricType, onFormatChange, shouldBootstrap]);

    useEffect(() => {
        if (metricType !== "CURRENCY" || previousMetricType === "CURRENCY") {
            return;
        }

        const matchesCurrencyPreset =
            normalizedFormat === null ? hasInheritPreset : presetFormats.includes(normalizedFormat);

        if (matchesCurrencyPreset) {
            return;
        }

        onFormatChange(resolveDefaultFormat(currencyFormatOverride, fallbackFormat));
    }, [
        currencyFormatOverride,
        fallbackFormat,
        hasInheritPreset,
        metricType,
        normalizedFormat,
        onFormatChange,
        presetFormats,
        previousMetricType,
    ]);
}

function resolveDefaultFormat(currencyFormatOverride: string | null | undefined, fallbackFormat: string) {
    return currencyFormatOverride ? null : fallbackFormat;
}

function usePreviousMetricType(metricType: MetricType | undefined) {
    const ref = useRef<MetricType | undefined>(undefined);
    useEffect(() => {
        ref.current = metricType;
    }, [metricType]);
    return ref.current;
}
