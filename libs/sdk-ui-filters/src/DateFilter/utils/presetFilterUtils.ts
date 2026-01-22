// (C) 2025-2026 GoodData Corporation

import { type DateFilterGranularity, type IActiveCalendars } from "@gooddata/sdk-model";

import { type DateFilterOption, type DateFilterRelativeOptionGroup } from "../interfaces/index.js";

/**
 * Granularities for the Standard tab
 */
const STANDARD_GRANULARITIES: DateFilterGranularity[] = [
    "GDC.time.year",
    "GDC.time.quarter",
    "GDC.time.month",
    "GDC.time.week_us",
    "GDC.time.date",
    "GDC.time.hour",
    "GDC.time.minute",
] as const;

/**
 * Fiscal-only granularities (used to detect if fiscal presets are available)
 */
const FISCAL_ONLY_GRANULARITIES: DateFilterGranularity[] = [
    "GDC.time.fiscal_year",
    "GDC.time.fiscal_quarter",
    "GDC.time.fiscal_month",
] as const;

/**
 * Granularities for the Fiscal tab (fiscal year/quarter/month + shared week/day/hour/minute)
 */
const FISCAL_TAB_GRANULARITIES: DateFilterGranularity[] = [
    "GDC.time.fiscal_year",
    "GDC.time.fiscal_quarter",
    "GDC.time.fiscal_month",
    "GDC.time.week_us",
    "GDC.time.date",
    "GDC.time.hour",
    "GDC.time.minute",
] as const;

/**
 * Type representing the calendar tab selection.
 * @alpha
 */
export type CalendarTabType = "standard" | "fiscal";

/**
 * Configuration for fiscal calendar tabs.
 * @alpha
 */
export interface IFiscalTabsConfig {
    hasFiscal: boolean;
    hasStandard: boolean;
    showTabs: boolean;
}

/**
 * Get fiscal tabs configuration based on available presets and active calendars settings.
 *
 * @remarks
 * When `activeCalendars` is provided, it controls which calendar types are enabled:
 * - `activeCalendars.standard === true` enables standard calendar
 * - `activeCalendars.fiscal === true` enables fiscal calendar
 * - Both enabled → show tabs for switching between calendars
 * - Only one enabled → no tabs, show only that calendar type
 *
 * When `activeCalendars` is undefined (not configured), defaults to standard only.
 *
 * @param presets - The relative presets option group to check, or undefined
 * @param activeCalendars - Optional active calendars configuration from workspace settings
 * @returns Configuration object with hasFiscal, hasStandard, and showTabs flags
 * @alpha
 */
export function getFiscalTabsConfig(
    presets: DateFilterRelativeOptionGroup | undefined,
    activeCalendars?: IActiveCalendars,
): IFiscalTabsConfig {
    // Check if presets contain the respective granularities
    const presetsHaveFiscal = presets ? FISCAL_ONLY_GRANULARITIES.some((g) => g in presets) : false;
    const presetsHaveStandard = presets ? STANDARD_GRANULARITIES.some((g) => g in presets) : false;

    // Determine effective calendar availability based on activeCalendars settings
    // When activeCalendars is undefined → default to standard only (no fiscal)
    const hasFiscal = activeCalendars ? activeCalendars.fiscal && presetsHaveFiscal : false;
    const hasStandard = activeCalendars
        ? activeCalendars.standard && presetsHaveStandard
        : presetsHaveStandard;

    const showTabs = hasFiscal && hasStandard;
    return { hasFiscal, hasStandard, showTabs };
}

/**
 * Determine the default calendar tab based on active calendars configuration.
 *
 * @remarks
 * Priority:
 * 1. If current preset uses fiscal-only granularity → fiscal tab
 * 2. If current preset uses standard-only granularity → standard tab
 * 3. If current preset uses shared granularity (week, day, etc.) → use settings default
 * 4. Fall back to "standard" if no configuration
 *
 * @param activeCalendars - Optional active calendars configuration from workspace settings
 * @param currentPreset - The currently selected date filter option
 * @returns The tab that should be selected by default
 * @alpha
 */
export function getDefaultCalendarTab(
    activeCalendars?: IActiveCalendars,
    currentPreset?: DateFilterOption,
): CalendarTabType {
    if (currentPreset) {
        const granularity = "granularity" in currentPreset ? currentPreset.granularity : undefined;

        if (granularity) {
            // Fiscal-only granularities → always fiscal tab
            if (FISCAL_ONLY_GRANULARITIES.some((g) => g === granularity)) {
                return "fiscal";
            }
            // Standard-only granularities → always standard tab
            if (STANDARD_GRANULARITIES_WITH_FISCAL_EQUIVALENT.includes(granularity)) {
                return "standard";
            }
        }
    }

    // Shared granularities or no preset → use settings default
    return activeCalendars?.fiscal && activeCalendars?.default === "FISCAL" ? "fiscal" : "standard";
}

/**
 * Check if the presets contain any fiscal granularities.
 * @param presets - The relative presets option group to check
 * @returns true if any fiscal granularities are present
 * @alpha
 */
export function hasFiscalPresets(presets: DateFilterRelativeOptionGroup): boolean {
    return FISCAL_ONLY_GRANULARITIES.some((g) => g in presets);
}

/**
 * Check if the presets contain any standard granularities.
 * @param presets - The relative presets option group to check
 * @returns true if any standard granularities are present
 * @alpha
 */
export function hasStandardPresets(presets: DateFilterRelativeOptionGroup): boolean {
    return STANDARD_GRANULARITIES.some((g) => g in presets);
}

function filterPresets(presets: DateFilterRelativeOptionGroup, granularities: DateFilterGranularity[]) {
    // Cast needed: DateFilterRelativeOptionGroup uses a mapped type where each granularity
    // has its own specific preset type, but we're building the object dynamically
    return granularities.reduce<Record<string, unknown>>((result, g) => {
        if (presets[g]) {
            result[g] = presets[g];
        }
        return result;
    }, {});
}

/**
 * Filter presets for the Standard tab.
 * @param presets - The relative presets option group to filter
 * @returns Filtered presets containing only standard granularities
 * @alpha
 */
export function filterStandardPresets(presets: DateFilterRelativeOptionGroup): DateFilterRelativeOptionGroup {
    return filterPresets(presets, STANDARD_GRANULARITIES);
}

/**
 * Filter presets for the Fiscal tab.
 * @param presets - The relative presets option group to filter
 * @returns Filtered presets containing fiscal granularities and shared granularities (week, day, hour, minute)
 * @alpha
 */
export function filterFiscalPresets(presets: DateFilterRelativeOptionGroup): DateFilterRelativeOptionGroup {
    return filterPresets(presets, FISCAL_TAB_GRANULARITIES);
}

/**
 * Determine which tab should be selected based on the selected preset's granularity.
 * @param preset - The currently selected date filter option
 * @returns "fiscal" if the preset uses a fiscal granularity, otherwise "standard"
 * @alpha
 */
export function getTabForPreset(preset: DateFilterOption): CalendarTabType {
    const granularity = "granularity" in preset ? preset.granularity : undefined;
    return FISCAL_ONLY_GRANULARITIES.some((g) => g === granularity) ? "fiscal" : "standard";
}

/**
 * Check if a granularity is a fiscal granularity.
 * @param granularity - The granularity to check
 * @returns true if the granularity is fiscal (fiscal_year, fiscal_quarter, or fiscal_month)
 * @alpha
 */
export function isFiscalGranularity(granularity: DateFilterGranularity): boolean {
    return FISCAL_ONLY_GRANULARITIES.includes(granularity);
}

/**
 * Standard granularities that have fiscal equivalents.
 * Used for filtering granularities when switching between standard/fiscal tabs.
 * @internal
 */
export const STANDARD_GRANULARITIES_WITH_FISCAL_EQUIVALENT: DateFilterGranularity[] = [
    "GDC.time.year",
    "GDC.time.quarter",
    "GDC.time.month",
];

/**
 * Mapping from standard granularities to their fiscal equivalents.
 * @internal
 */
export const STANDARD_TO_FISCAL_GRANULARITY: Partial<Record<DateFilterGranularity, DateFilterGranularity>> = {
    "GDC.time.year": "GDC.time.fiscal_year",
    "GDC.time.quarter": "GDC.time.fiscal_quarter",
    "GDC.time.month": "GDC.time.fiscal_month",
};

/**
 * Mapping from fiscal granularities to their standard equivalents.
 * @internal
 */
export const FISCAL_TO_STANDARD_GRANULARITY: Partial<Record<DateFilterGranularity, DateFilterGranularity>> = {
    "GDC.time.fiscal_year": "GDC.time.year",
    "GDC.time.fiscal_quarter": "GDC.time.quarter",
    "GDC.time.fiscal_month": "GDC.time.month",
};

/**
 * Filter granularities for the standard tab view.
 * Excludes all fiscal granularities.
 * @param granularities - Available granularities to filter
 * @returns Granularities suitable for standard tab
 * @internal
 */
export function filterStandardGranularities(granularities: DateFilterGranularity[]): DateFilterGranularity[] {
    return granularities.filter((g) => !isFiscalGranularity(g));
}

/**
 * Filter granularities for the fiscal tab view.
 * Includes fiscal granularities and shared granularities (week, day, hour, minute).
 * @param granularities - Available granularities to filter
 * @returns Granularities suitable for fiscal tab
 * @internal
 */
export function filterFiscalGranularities(granularities: DateFilterGranularity[]): DateFilterGranularity[] {
    return granularities.filter(
        (g) => isFiscalGranularity(g) || !STANDARD_GRANULARITIES_WITH_FISCAL_EQUIVALENT.includes(g),
    );
}

/**
 * Get the effective calendar type based on tabs config and selected tab.
 * @internal
 */
function getEffectiveCalendarType(config: IFiscalTabsConfig, selectedTab: CalendarTabType): CalendarTabType {
    return config.showTabs ? selectedTab : config.hasFiscal ? "fiscal" : "standard";
}

/**
 * Filter relative presets based on fiscal tabs configuration.
 * When only one calendar type is enabled, filters to that type.
 * When both are enabled, filters based on selected tab.
 * @internal
 */
export function getFilteredPresets(
    presets: DateFilterRelativeOptionGroup | undefined,
    config: IFiscalTabsConfig,
    selectedTab: CalendarTabType,
): DateFilterRelativeOptionGroup | undefined {
    if (!presets) {
        return presets;
    }
    if (!config.hasFiscal && !config.hasStandard) {
        return filterStandardPresets(presets);
    }
    const activeType = getEffectiveCalendarType(config, selectedTab);
    return activeType === "standard" ? filterStandardPresets(presets) : filterFiscalPresets(presets);
}

/**
 * Filter available granularities based on fiscal tabs configuration.
 * @internal
 */
export function getFilteredGranularities(
    granularities: DateFilterGranularity[] | undefined,
    config: IFiscalTabsConfig,
    selectedTab: CalendarTabType,
): DateFilterGranularity[] {
    if (!granularities) {
        return [];
    }
    if (!config.hasFiscal && !config.hasStandard) {
        return filterStandardGranularities(granularities);
    }
    const activeType = getEffectiveCalendarType(config, selectedTab);
    return activeType === "standard"
        ? filterStandardGranularities(granularities)
        : filterFiscalGranularities(granularities);
}

/**
 * @internal
 */
export interface IUiRelativeDateFilterFormLike {
    granularity?: DateFilterGranularity;
    from?: number;
    to?: number;
}

/**
 * Ensures the granularity in a relative filter option is compatible with the available granularities.
 * If the current granularity is not available, maps it to an equivalent or picks the first available.
 * @param filterOption - The filter option to check/correct
 * @param availableGranularities - List of available granularities
 * @param fiscalFirst - Whether to prefer fiscal granularities when mapping
 * @returns The filter option with a compatible granularity
 * @internal
 */
export function ensureCompatibleGranularity<T extends IUiRelativeDateFilterFormLike>(
    filterOption: T,
    availableGranularities: DateFilterGranularity[],
    fiscalFirst: boolean,
): T {
    const currentGranularity = filterOption.granularity;

    // If current granularity is available, no change needed
    if (currentGranularity && availableGranularities.includes(currentGranularity)) {
        return filterOption;
    }

    // Try to map to equivalent granularity
    let newGranularity: DateFilterGranularity | undefined;
    let isEquivalentMapping = false;

    if (currentGranularity) {
        const mapping = fiscalFirst ? STANDARD_TO_FISCAL_GRANULARITY : FISCAL_TO_STANDARD_GRANULARITY;
        newGranularity = mapping[currentGranularity];
        // Check if we found an equivalent that's available
        isEquivalentMapping = !!newGranularity && availableGranularities.includes(newGranularity);
    }

    // If mapping didn't work or no current granularity, use first available
    if (!newGranularity || !availableGranularities.includes(newGranularity)) {
        newGranularity = availableGranularities[0];
    }

    // Only clear from/to if this is NOT an equivalent mapping
    // Equivalent mappings (month↔fiscal_month, etc.) preserve the same period length,
    // so the from/to values remain semantically valid
    return {
        ...filterOption,
        granularity: newGranularity,
        from: isEquivalentMapping ? filterOption.from : undefined,
        to: isEquivalentMapping ? filterOption.to : undefined,
    };
}
