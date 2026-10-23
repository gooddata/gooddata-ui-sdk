// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import { type MetricType } from "@gooddata/sdk-model";
import { type IFormatPreset } from "@gooddata/sdk-ui-kit";

import { useFormValues } from "../../../shared/Form/useFormValues.js";
import { FormField, type FormMetric } from "../data.js";

import { useMetricFormField } from "./useMetricFormField.js";

interface IUseMetricFormatStateParams {
    enableMetricFormatOverrides: boolean;
    currencyFormatOverride?: string | null;
    presets: IFormatPreset[];
}

interface IMetricFormatState {
    /** Current metric type (CURRENCY or undefined) */
    metricType: MetricType | undefined;
    /** Normalized format value (null = inherit, "" = empty, string = explicit) */
    normalizedFormat: string | null;
    /** Whether format is missing (null or empty string) */
    isFormatMissing: boolean;
    /** The inherit preset if available, null otherwise */
    inheritPreset: IFormatPreset | null;
    /** Whether the format field is read-only */
    isReadOnly: boolean;
    /** Function to update the format value */
    setFormat: (value: string | null) => void;
    /** Configuration for useCurrencyFormatDefaults hook */
    currencyFormatDefaultsConfig: {
        metricType: MetricType | undefined;
        currencyFormatOverride: string | null | undefined;
        shouldBootstrap: boolean;
    };
}

/**
 * Hook that manages metric format state and provides normalized values
 * for the number format component.
 *
 * Extracts complex format logic:
 * - Format value normalization (form value vs default value)
 * - Metric type determination based on feature flag
 * - Inherit preset lookup
 * - Currency bootstrap detection
 * - Currency preset format extraction
 */
export function useMetricFormatState({
    enableMetricFormatOverrides,
    currencyFormatOverride,
    presets,
}: IUseMetricFormatStateParams): IMetricFormatState {
    const formatField = useMetricFormField(FormField.format);
    const { isReadOnly, setValue, defaultValues } = formatField;

    const metricTypeField = useMetricFormField(FormField.metricType);
    const metricType = enableMetricFormatOverrides ? metricTypeField.value : undefined;

    const formValues = useFormValues<FormMetric>();
    const formFormatValue = formValues.format;

    // Normalize format: use form value if set, otherwise fall back to default
    const effectiveFormat = formFormatValue === undefined ? defaultValues?.format : formFormatValue;
    const normalizedFormat =
        effectiveFormat === undefined ? null : effectiveFormat === "" ? "" : effectiveFormat;
    const isFormatMissing = normalizedFormat === null || normalizedFormat === "";

    // Find inherit preset if available
    const inheritPreset = useMemo(
        () => presets.find((preset) => preset.localIdentifier === "inherit") ?? null,
        [presets],
    );

    // Determine if we should bootstrap currency format defaults
    const shouldBootstrapCurrencyFormat =
        enableMetricFormatOverrides &&
        metricType === "CURRENCY" &&
        formFormatValue === undefined &&
        (defaultValues?.format === undefined ||
            defaultValues?.format === null ||
            defaultValues?.format === "");

    return {
        metricType,
        normalizedFormat,
        isFormatMissing,
        inheritPreset,
        isReadOnly,
        setFormat: setValue,
        currencyFormatDefaultsConfig: {
            metricType,
            currencyFormatOverride,
            shouldBootstrap: shouldBootstrapCurrencyFormat,
        },
    };
}
