// (C) 2026 GoodData Corporation

// "base" sensitivity compares letters only, so "a", "A" and "á" are equal
const collator = new Intl.Collator(undefined, { usage: "search", sensitivity: "base" });

/**
 * Whether the text contains the query, ignoring case and diacritics ("zlta" finds "Žltá"), e.g. for the `filter`
 * of UiSearchableSelect.
 *
 * @internal
 */
export function matchesSearchQuery(textValue: string, query: string): boolean {
    // Intl.Collator compares whole strings, so compare every part of the text that is as long as the query
    for (let start = 0; start + query.length <= textValue.length; start++) {
        if (collator.compare(textValue.slice(start, start + query.length), query) === 0) {
            return true;
        }
    }

    return false;
}
