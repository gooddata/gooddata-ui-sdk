// (C) 2025-2026 GoodData Corporation

const alphabeticalNameCollator = new Intl.Collator("en", { sensitivity: "base", numeric: true });

/**
 * Compares two strings using consistent alphabetical semantics used across geo next internals.
 *
 * @internal
 */
export function compareAlphabetically(left: string, right: string): number {
    return alphabeticalNameCollator.compare(left, right);
}

/**
 * Compares two strings using strict lexicographic order (locale-independent).
 *
 * @internal
 */
export function compareLexicographically(left: string, right: string): number {
    if (left === right) {
        return 0;
    }

    return left < right ? -1 : 1;
}
