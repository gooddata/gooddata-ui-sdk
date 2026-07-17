// (C) 2025-2026 GoodData Corporation

import {
    type DateFilterGranularity,
    type IActiveCalendars,
    belongsToCalendar,
    getDateFilterGranularities,
    getFiscalEquivalent,
    getStandardEquivalent,
    isDateFilterGranularity,
} from "@gooddata/sdk-model";

import { type DateFilterOption, type DateFilterRelativeOptionGroup } from "../interfaces/index.js";

// Granularity sets derived from the shared sdk-model registry (single source of truth).
const STANDARD_GRANULARITIES = getDateFilterGranularities({ calendars: [{ type: "standard" }] });
const FISCAL_ONLY_GRANULARITIES = getDateFilterGranularities({
    calendars: [{ type: "fiscal" }],
    includeShared: false,
});
const FISCAL_TAB_GRANULARITIES = getDateFilterGranularities({
    calendars: [{ type: "fiscal" }],
    includeShared: true,
});

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
 * Standard granularities that have fiscal equivalents (year, quarter, month).
 * Used for determining which tab to show based on selected granularity.
 * @alpha
 */
export const STANDARD_GRANULARITIES_WITH_FISCAL_EQUIVALENT: DateFilterGranularity[] =
    STANDARD_GRANULARITIES.filter((g) => getFiscalEquivalent(g) !== undefined);

// Equivalence map, keeping only entries whose equivalent is a valid DateFilterGranularity.
const buildEquivalenceMap = (
    from: DateFilterGranularity[],
    getEquivalent: (g: DateFilterGranularity) => string | undefined,
): Partial<Record<DateFilterGranularity, DateFilterGranularity>> => {
    const map: Partial<Record<DateFilterGranularity, DateFilterGranularity>> = {};
    for (const g of from) {
        const equivalent = getEquivalent(g);
        if (isDateFilterGranularity(equivalent)) {
            map[g] = equivalent;
        }
    }
    return map;
};

/**
 * Mapping from standard granularities to their fiscal equivalents.
 * @internal
 */
export const STANDARD_TO_FISCAL_GRANULARITY = buildEquivalenceMap(
    STANDARD_GRANULARITIES_WITH_FISCAL_EQUIVALENT,
    getFiscalEquivalent,
);

/**
 * Mapping from fiscal granularities to their standard equivalents.
 * @internal
 */
export const FISCAL_TO_STANDARD_GRANULARITY = buildEquivalenceMap(
    FISCAL_ONLY_GRANULARITIES,
    getStandardEquivalent,
);

/**
 * Filter granularities for the standard tab view.
 * Excludes all fiscal granularities.
 * @param granularities - Available granularities to filter
 * @returns Granularities suitable for standard tab
 * @internal
 */
export function filterStandardGranularities(granularities: DateFilterGranularity[]): DateFilterGranularity[] {
    return granularities.filter((g) => belongsToCalendar(g, "standard"));
}

/**
 * Filter granularities for the fiscal tab view.
 * Includes fiscal granularities and shared granularities (week, day, hour, minute).
 * @param granularities - Available granularities to filter
 * @returns Granularities suitable for fiscal tab
 * @internal
 */
export function filterFiscalGranularities(granularities: DateFilterGranularity[]): DateFilterGranularity[] {
    return granularities.filter((g) => belongsToCalendar(g, "fiscal"));
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
