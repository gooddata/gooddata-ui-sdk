// (C) 2026 GoodData Corporation

/**
 * Partitions attachment formats for the schedule picker based on their current availability.
 * Callers decide which formats are not offered (slide formats when slide exports are disabled,
 * tabular PDF in Accessibility Mode, …) and pass them as `excluded`.
 *
 * - `available` — formats to offer in the picker (`excluded` ones omitted).
 * - `visibleSelected` — currently-selected formats to render as chips (offered ones only).
 * - `buildNextSelection` — builds the next full selection from the formats picked in the picker:
 *   keeps only offered formats from `picked` and appends the selected-but-not-offered ones (e.g. a
 *   slide deck the schedule already had while the feature was enabled). Those are kept out of the
 *   UI entirely, but dropping them from the selection would mean an unrelated edit silently
 *   removes them — always route picker output through this. Deletes are exempt: they operate on
 *   the full selection, which already contains the hidden formats. Note it normalizes rather than
 *   errors: unknown or hidden formats in `picked` are dropped, never duplicated.
 */
export function partitionAttachments<T extends string>({
    all,
    selected,
    excluded = [],
}: {
    all: readonly T[];
    selected: readonly T[];
    excluded?: readonly T[];
}): {
    available: T[];
    visibleSelected: T[];
    buildNextSelection: (picked: readonly T[]) => T[];
} {
    const available = all.filter((format) => !excluded.includes(format));
    const visibleSelected = selected.filter((f) => available.includes(f));
    const hiddenSelected = selected.filter((f) => !available.includes(f));
    return {
        available,
        visibleSelected,
        buildNextSelection: (picked) => [...picked.filter((f) => available.includes(f)), ...hiddenSelected],
    };
}
