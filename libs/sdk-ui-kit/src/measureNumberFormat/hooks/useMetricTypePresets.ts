// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import type { MetricType } from "@gooddata/sdk-model";

import { createCurrencyPresets } from "../presets/currencyPresets.js";
import { createStandardPresets } from "../presets/standardPresets.js";
import { createAdvancedTemplates } from "../presets/templates.js";
import { type IFormatPreset, type IFormatTemplate } from "../typings.js";

const INHERIT_MESSAGE_ID = "measureNumberFormat.numberFormat.preset.inherit";

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
     * Format templates for the Custom dialog.
     * For CURRENCY metrics: only advanced templates (currency formats are in presets).
     * For other types: all templates.
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
 * @internal
 */
export function useMetricTypePresets({
    metricType,
    currencyFormatOverride,
    formatMessage,
}: UseMetricTypePresetsConfig): UseMetricTypePresetsResult {
    // Standard numeric presets
    const standardPresets = useMemo(() => createStandardPresets(formatMessage), [formatMessage]);

    // Base currency presets
    const baseCurrencyPresets = useMemo(() => createCurrencyPresets(formatMessage), [formatMessage]);

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
                name: formatMessage({ id: INHERIT_MESSAGE_ID }),
                localIdentifier: "inherit",
                format: currencyFormatOverride,
                previewNumber: 1000.12,
            };
        }
        return null;
    }, [metricType, currencyFormatOverride, formatMessage]);

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

    // Templates - for CURRENCY, no templates (all formats are presets, Custom dialog is manual-only)
    const templates = useMemo(() => {
        if (metricType === "CURRENCY") {
            // For CURRENCY metrics, no templates - all formats are in presets
            // Custom dialog only allows manual format entry
            return [];
        }
        // For non-CURRENCY, show advanced templates
        return createAdvancedTemplates(formatMessage);
    }, [metricType, formatMessage]);

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
 * Hook that creates advanced format templates.
 * Returns only templates that don't duplicate presets (complex conditional formats).
 *
 * @param formatMessage - Function to format localized messages
 * @returns Array of advanced format templates
 * @internal
 */
export function useFormatTemplates(formatMessage: (descriptor: { id: string }) => string): IFormatTemplate[] {
    return useMemo(() => createAdvancedTemplates(formatMessage), [formatMessage]);
}
