// (C) 2007-2026 GoodData Corporation

/**
 * Parses comma-separated and newline-separated input into a list of values.
 * Supports double-quoted strings for values that contain commas.
 * When a value equals emptyValueDisplay (e.g. "(empty value)"), it is converted to null.
 * When a value is an explicit empty quoted string (""), it is stored as an empty string.
 *
 * @param input - Raw input string (e.g. "Berlin, Prague, (empty value)" or "Berlin\nPrague")
 * @param emptyValueDisplay - Localized string for empty value (e.g. "(empty value)"). When a parsed token equals this, result is null.
 * @returns Array of parsed values (strings or null)
 * @internal
 */
export function parseArbitraryValues(input: string, emptyValueDisplay: string): Array<string | null> {
    const result: Array<string | null> = [];
    let current = "";
    let inQuotes = false;
    let hadQuotes = false;

    for (let i = 0; i < input.length; i++) {
        const char = input[i];
        // there is difference between straight quotes and curly quotes
        if (char === '"' || char === "“" || char === "”") {
            hadQuotes = true;
            inQuotes = !inQuotes;
        } else if ((char === "," || char === "\n" || char === "\r") && !inQuotes) {
            const trimmed = current.trim();
            if (trimmed) {
                result.push(trimmed === emptyValueDisplay ? null : trimmed);
            } else if (hadQuotes) {
                // User typed "" explicitly — store as real empty string
                result.push("");
            }
            current = "";
            hadQuotes = false;
        } else {
            current += char;
        }
    }

    const trimmed = current.trim();
    if (trimmed) {
        result.push(trimmed === emptyValueDisplay ? null : trimmed);
    } else if (hadQuotes) {
        result.push("");
    }

    return result;
}
