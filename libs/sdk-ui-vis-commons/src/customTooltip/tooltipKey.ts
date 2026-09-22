// (C) 2026 GoodData Corporation

/**
 * Lookup-key helpers shared by {@link buildLookupTable} and the chart-family hover-time
 * key builders. Both sides must produce identical strings.
 *
 * Format: `${localIdentifier}:${uri}` per attribute, joined by `|` after lexicographic sort.
 *
 * The identity is the attribute's `localIdentifier`, not its display form identifier. An LDM
 * identifier is unique only within an object type, so a label and a computed attribute may
 * share one. Keying by display form identifier would then put two segments with the same
 * identifier into one key, and because the segments are sorted, the attribute-to-value
 * pairing is lost: two rows whose values are swaps of each other collapse onto the same key.
 * A `localIdentifier` is unique within an execution, so it cannot collide.
 *
 * Both sides agree on it because {@link buildTooltipExecution} slices the tooltip execution
 * by the chart's own attributes with their `localIdentifier`s preserved, and because
 * {@link IAttributeDescriptor}'s `localIdentifier` references back to the attribute that was
 * on the input to the execution.
 *
 * Name is omitted: the backend substitutes null/empty names with localized strings only on
 * the display side, so including them here causes lookup-vs-hover mismatches on null/empty
 * rows.
 */

/**
 * @internal
 */
export function buildKeySegment(localIdentifier: string, uri: string): string {
    return `${localIdentifier}:${uri}`;
}

/**
 * @internal
 */
export function joinKeySegments(parts: readonly string[]): string {
    return [...parts].sort().join("|");
}
