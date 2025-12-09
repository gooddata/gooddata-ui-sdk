// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import type { MetricType } from "@gooddata/sdk-model";

import { createCurrencyPresets } from "../presets/currencyPresets.js";
import { DEFAULT_STANDARD_PRESET_PREFIX, createStandardPresets } from "../presets/standardPresets.js";
import { CURRENCY_TEMPLATE_IDS, DEFAULT_TEMPLATE_PREFIX, createAllTemplates } from "../presets/templates.js";
import { type IFormatPreset, type IFormatTemplate } from "../typings.js";

/**
 * Configuration for the useMetricTypePresets hook.
 * @internal
 */
export interface UseMetricTypePresetsConfig {
    /**
     * The metric type. When "CURRENCY", currency-specific presets are shown.
     * When undefined, standard numeric presets are shown.
     */
    metricType?: MetricType;

    /**
     * The currency format override from workspace settings.
     * When set and metricType is "CURRENCY", an "inherit" preset is added.
     */
    currencyFormatOverride?: string | null;

    /**
     * Function to format localized messages (e.g., from react-intl).
     */
    formatMessage: (descriptor: { id: string }) => string;

    /**
     * Optional prefix for preset message IDs.
     * Default: "metricComponent.numberFormat.preset"
     *
     * Use this to customize the translation keys for presets.
     * For example, set to "measure_number_format.preset" for Analytical Designer compatibility.
     */
    presetMessageIdPrefix?: string;

    /**
     * Optional prefix for template message IDs.
     * Default: "metricComponent.numberFormat.template"
     *
     * Use this to customize the translation keys for templates.
     * For example, set to "measure_number_format.template" for Analytical Designer compatibility.
     */
    templateMessageIdPrefix?: string;
}

/**
 * Result from the useMetricTypePresets hook.
 * @internal
 */
export interface UseMetricTypePresetsResult {
    /**
     * Format presets based on metric type.
     * For CURRENCY: currency presets with optional inherit preset.
     * For other types: standard numeric presets.
     */
    presets: IFormatPreset[];

    /**
     * Format templates. For CURRENCY metrics, currency templates are excluded
     * from the general list (they're already in presets).
     */
    templates: IFormatTemplate[];

    /**
     * The inherit preset if available (only for CURRENCY with override).
     */
    inheritPreset: IFormatPreset | null;
}

/**
 * Hook that creates format presets and templates based on metric type.
 *
 * This hook encapsulates the logic for building format options that respect:
 * - Metric type (CURRENCY vs standard)
 * - Currency format override (creates "inherit" preset)
 *
 * @example
 * ```tsx
 * const { presets, templates, inheritPreset } = useMetricTypePresets({
 *   metricType: "CURRENCY",
 *   currencyFormatOverride: "$#,##0.00",
 *   formatMessage: (d) => intl.formatMessage(d),
 * });
 * ```
 *
 * @example
 * ```tsx
 * // With custom message ID prefixes (e.g., for Analytical Designer)
 * const { presets, templates } = useMetricTypePresets({
 *   metricType: undefined,
 *   formatMessage: (d) => intl.formatMessage(d),
 *   presetMessageIdPrefix: "measure_number_format.preset",
 *   templateMessageIdPrefix: "measure_number_format.template",
 * });
 * ```
 *
 * @internal
 */
export function useMetricTypePresets({
    metricType,
    currencyFormatOverride,
    formatMessage,
    presetMessageIdPrefix = DEFAULT_STANDARD_PRESET_PREFIX,
    templateMessageIdPrefix = DEFAULT_TEMPLATE_PREFIX,
}: UseMetricTypePresetsConfig): UseMetricTypePresetsResult {
    // Standard numeric presets
    const standardPresets = useMemo(
        () => createStandardPresets(formatMessage, presetMessageIdPrefix),
        [formatMessage, presetMessageIdPrefix],
    );

    // Base currency presets
    const baseCurrencyPresets = useMemo(
        () => createCurrencyPresets(formatMessage, presetMessageIdPrefix),
        [formatMessage, presetMessageIdPrefix],
    );

    // Currency presets, excluding the override format if it matches a preset
    const currencyPresets = useMemo(() => {
        if (!currencyFormatOverride) {
            return baseCurrencyPresets;
        }
        return baseCurrencyPresets.filter((preset) => preset.format !== currencyFormatOverride);
    }, [baseCurrencyPresets, currencyFormatOverride]);

    // Inherit preset - only for CURRENCY when override exists
    const inheritPreset: IFormatPreset | null = useMemo(() => {
        if (metricType === "CURRENCY" && currencyFormatOverride) {
            return {
                name: formatMessage({ id: `${presetMessageIdPrefix}.inherit` }),
                localIdentifier: "inherit",
                format: currencyFormatOverride,
                previewNumber: 1000.12,
            };
        }
        return null;
    }, [metricType, currencyFormatOverride, formatMessage, presetMessageIdPrefix]);

    // Final presets based on metric type
    const presets = useMemo(() => {
        if (metricType === "CURRENCY") {
            if (inheritPreset) {
                return [inheritPreset, ...currencyPresets];
            }
            return currencyPresets;
        }
        return standardPresets;
    }, [metricType, standardPresets, currencyPresets, inheritPreset]);

    // Templates - for CURRENCY, show ONLY currency templates
    const templates = useMemo(() => {
        if (metricType === "CURRENCY") {
            // For CURRENCY metrics, show only currency-specific templates
            return createAllTemplates(formatMessage, templateMessageIdPrefix).filter((t) =>
                CURRENCY_TEMPLATE_IDS.includes(t.localIdentifier),
            );
        }
        // For non-CURRENCY, show all templates
        return createAllTemplates(formatMessage, templateMessageIdPrefix);
    }, [metricType, formatMessage, templateMessageIdPrefix]);

    return {
        presets,
        templates,
        inheritPreset,
    };
}

/**
 * Hook that creates standard numeric format presets.
 * Use this when you don't need metric type awareness.
 *
 * @param formatMessage - Function to format localized messages
 * @returns Array of standard format presets
 * @internal
 */
export function useStandardPresets(formatMessage: (descriptor: { id: string }) => string): IFormatPreset[] {
    return useMemo(() => createStandardPresets(formatMessage), [formatMessage]);
}

/**
 * Hook that creates all format templates.
 * Use this when you need templates without metric type filtering.
 *
 * @param formatMessage - Function to format localized messages
 * @param excludeCurrencyTemplates - Whether to exclude currency-specific templates
 * @returns Array of format templates
 * @internal
 */
export function useFormatTemplates(
    formatMessage: (descriptor: { id: string }) => string,
    excludeCurrencyTemplates = false,
): IFormatTemplate[] {
    return useMemo(() => {
        const allTemplates = createAllTemplates(formatMessage);
        if (excludeCurrencyTemplates) {
            return allTemplates.filter((t) => !CURRENCY_TEMPLATE_IDS.includes(t.localIdentifier));
        }
        return allTemplates;
    }, [formatMessage, excludeCurrencyTemplates]);
}
