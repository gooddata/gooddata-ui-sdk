// (C) 2026 GoodData Corporation

/**
 * Built-in CSV delimiter presets.
 *
 * Each entry contains the preset identifier, the delimiter character,
 * and a preview symbol for display purposes.
 *
 * @alpha
 */
export const CSV_DELIMITER_PRESETS = [
    { id: "comma", delimiter: ",", previewSymbol: "," },
    { id: "semicolon", delimiter: ";", previewSymbol: ";" },
    { id: "pipe", delimiter: "|", previewSymbol: "|" },
    { id: "tab", delimiter: "\t", previewSymbol: "⇥" },
] as const;

/**
 * The default CSV delimiter character (comma).
 *
 * @alpha
 */
export const DEFAULT_CSV_DELIMITER = CSV_DELIMITER_PRESETS[0].delimiter;

const SUPPORTED_CSV_DELIMITER_REGEXP = /^[\t !#$%&()*+\-.,/:;<=>?@\[\]\\^_{|}~]$/;

/**
 * Identifier of a CSV delimiter preset, or "custom" when the user provides their own character.
 *
 * @alpha
 */
export type CsvDelimiterPreset = (typeof CSV_DELIMITER_PRESETS)[number]["id"] | "custom";

/**
 * Validation error codes returned by {@link getCsvDelimiterValidationError}.
 *
 * - `"singleCharacter"` — the value is empty or longer than one character.
 * - `"unsupportedCharacter"` — the character is not in the allowed set.
 *
 * @alpha
 */
export type CsvDelimiterValidationError = "singleCharacter" | "unsupportedCharacter";

/**
 * Validates a custom delimiter string and returns the first validation error, or `undefined` if valid.
 *
 * @param delimiter - the custom delimiter string to validate
 * @returns validation error code, or `undefined` when the delimiter is acceptable
 * @alpha
 */
export function getCsvDelimiterValidationError(delimiter: string): CsvDelimiterValidationError | undefined {
    if (delimiter.length !== 1) {
        return "singleCharacter";
    }

    if (!SUPPORTED_CSV_DELIMITER_REGEXP.test(delimiter)) {
        return "unsupportedCharacter";
    }

    return undefined;
}

/**
 * Resolves a delimiter character to its corresponding preset identifier.
 *
 * Returns `"custom"` when the delimiter does not match any built-in preset,
 * or the default preset id (`"comma"`) when no delimiter is provided.
 *
 * @param delimiter - delimiter character to look up
 * @returns the matching preset id, `"custom"`, or the default
 * @alpha
 */
export function getCsvDelimiterPreset(delimiter?: string): CsvDelimiterPreset {
    const preset = CSV_DELIMITER_PRESETS.find((item) => item.delimiter === delimiter);

    if (preset) {
        return preset.id;
    }

    return delimiter ? "custom" : CSV_DELIMITER_PRESETS[0].id;
}

/**
 * Returns the actual delimiter character for a given preset selection.
 *
 * When the preset is `"custom"`, the provided custom delimiter string is returned as-is.
 *
 * @param selectedPreset - the selected preset identifier
 * @param customDelimiter - the user-provided custom delimiter (used only when preset is `"custom"`)
 * @returns the resolved delimiter character
 * @alpha
 */
export function getCsvDelimiterValue(selectedPreset: CsvDelimiterPreset, customDelimiter: string): string {
    if (selectedPreset === "custom") {
        return customDelimiter;
    }

    return (
        CSV_DELIMITER_PRESETS.find((item) => item.id === selectedPreset)?.delimiter ?? DEFAULT_CSV_DELIMITER
    );
}

/**
 * Resolves a delimiter value into its preset identifier and custom delimiter components.
 *
 * Maps the delimiter to a preset when possible, otherwise sets the preset to
 * `"custom"` and populates the custom delimiter field.
 *
 * @param delimiter - the persisted delimiter value (e.g. from workspace settings)
 * @alpha
 */
export function getCsvDelimiterState(delimiter?: string): {
    selectedPreset: CsvDelimiterPreset;
    customDelimiter: string;
} {
    const selectedPreset = getCsvDelimiterPreset(delimiter);

    return {
        selectedPreset,
        customDelimiter: selectedPreset === "custom" ? (delimiter ?? "") : "",
    };
}
