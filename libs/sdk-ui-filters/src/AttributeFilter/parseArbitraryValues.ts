// (C) 2007-2026 GoodData Corporation

/**
 * Parses comma-separated and newline-separated input into a list of values.
 * Supports double-quoted strings for values that contain commas.
 * When a value equals emptyValueDisplay (e.g. "(empty value)"), it is converted to empty string.
 *
 * @param input - Raw input string (e.g. "Berlin, Prague, (empty value)" or "Berlin\nPrague")
 * @param emptyValueDisplay - Localized string for empty value (e.g. "(empty value)"). When a parsed token equals this, result is "".
 * @returns Array of parsed values
 * @internal
 */
export function parseArbitraryValues(input: string, emptyValueDisplay: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < input.length; i++) {
        const char = input[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if ((char === "," || char === "\n" || char === "\r") && !inQuotes) {
            const trimmed = current.trim();
            if (trimmed) {
                result.push(trimmed === emptyValueDisplay ? "" : trimmed);
            }
            current = "";
        } else {
            current += char;
        }
    }

    const trimmed = current.trim();
    if (trimmed) {
        result.push(trimmed === emptyValueDisplay ? "" : trimmed);
    }

    return result;
}
