// (C) 2026 GoodData Corporation

/**
 * Partitions attachment formats for the schedule picker when slide deck exports may be disabled.
 *
 * - `available` — formats to offer in the picker (slide formats dropped when disabled).
 * - `visibleSelected` — currently-selected formats to render as chips (offered ones only).
 * - `hiddenSelected` — currently-selected formats that are not offered (e.g. a slide deck the
 *   schedule already had while the feature was enabled). These are kept out of the UI entirely but
 *   must be merged back on save, otherwise an unrelated edit would silently drop them.
 */
export function partitionAttachments<T extends string>(
    all: readonly T[],
    slideFormats: readonly T[],
    selected: readonly T[],
    isSlidesExportEnabled: boolean,
): { available: T[]; visibleSelected: T[]; hiddenSelected: T[] } {
    const available = isSlidesExportEnabled ? [...all] : all.filter((f) => !slideFormats.includes(f));
    const visibleSelected = selected.filter((f) => available.includes(f));
    const hiddenSelected = selected.filter((f) => !available.includes(f));
    return { available, visibleSelected, hiddenSelected };
}
