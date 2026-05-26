// (C) 2026 GoodData Corporation

/**
 * Lookup-key helpers shared by `buildLookupTable` and chart-family hover-time
 * key builders. Both sides must produce identical strings.
 *
 * Format: `${displayFormId}:${uri}` per attribute, joined by `|` after
 * lexicographic sort. The `displayFormId` is always the idRef identifier —
 * uriRef-backed display forms are skipped at the tooltip-execution-planning
 * step (in each chart family's adapter), so they never reach this key builder.
 * Name is omitted: the backend substitutes null/empty names with localized
 * strings only on the display side, so including them here causes
 * lookup-vs-hover mismatches on null/empty rows.
 */

/**
 * @internal
 */
export function buildKeySegment(displayFormId: string, uri: string): string {
    return `${displayFormId}:${uri}`;
}

/**
 * @internal
 */
export function joinKeySegments(parts: readonly string[]): string {
    return [...parts].sort().join("|");
}
