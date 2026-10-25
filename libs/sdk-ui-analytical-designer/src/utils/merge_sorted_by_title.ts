// (C) 2026 GoodData Corporation

/**
 * Merges two independently sorted lists into one list sorted alphabetically by title.
 *
 * The catalog answers attributes and computed attributes as separate lists, each sorted on its own;
 * a plain concatenation would strand every computed attribute at the tail of a picker instead of
 * filing it in among the regular attributes.
 */
export function mergeSortedAlphabeticallyByTitle<T>(
    first: ReadonlyArray<T>,
    second: ReadonlyArray<T>,
    titleOf: (item: T) => string,
): T[] {
    const collator = new Intl.Collator();
    return [...first, ...second].sort((a, b) => collator.compare(titleOf(a), titleOf(b)));
}
