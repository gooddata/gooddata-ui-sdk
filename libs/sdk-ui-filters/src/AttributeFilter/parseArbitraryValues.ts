// (C) 2007-2026 GoodData Corporation

/**
 * Parses comma-separated and newline-separated input into a list of values.
 * Supports double-quoted strings for values that contain commas.
 * Use backslash to escape a quote character (\") or a backslash itself (\\), both inside and outside quotes.
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
    let skipNext = false;

    for (let i = 0; i < input.length; i++) {
        if (skipNext) {
            skipNext = false;
            continue;
        }

        const char = input[i];

        if (inQuotes) {
            if (char === "\\" && i + 1 < input.length) {
                const next = input[i + 1];
                if (isQuoteCharacter(next) || next === "\\") {
                    current += next;
                    skipNext = true;
                } else {
                    current += char;
                }
            } else if (isQuoteCharacter(char)) {
                inQuotes = false;
            } else {
                current += char;
            }
        } else if (char === "\\" && i + 1 < input.length) {
            const next = input[i + 1];
            if (isQuoteCharacter(next) || next === "\\") {
                current += next;
                skipNext = true;
            } else {
                current += char;
            }
        } else if (isQuoteCharacter(char)) {
            hadQuotes = true;
            inQuotes = true;
        } else if (isDelimiterCharacter(char)) {
            pushValue(result, current, hadQuotes, emptyValueDisplay);
            current = "";
            hadQuotes = false;
        } else {
            current += char;
        }
    }

    pushValue(result, current, hadQuotes, emptyValueDisplay);

    return result;
}

function pushValue(
    result: Array<string | null>,
    raw: string,
    hadQuotes: boolean,
    emptyValueDisplay: string,
): void {
    const trimmed = raw.trim();
    if (trimmed) {
        result.push(trimmed === emptyValueDisplay ? null : trimmed);
    } else if (hadQuotes) {
        // User typed "" explicitly — store as real empty string
        result.push("");
    }
}

function isQuoteCharacter(char: string): boolean {
    return char === '"' || char === "\u201c" || char === "\u201d";
}

function isDelimiterCharacter(char: string): boolean {
    return char === "," || char === "\n" || char === "\r";
}
