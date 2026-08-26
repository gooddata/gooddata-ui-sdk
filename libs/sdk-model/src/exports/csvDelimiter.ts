// (C) 2026 GoodData Corporation

/**
 * Built-in CSV delimiter presets keyed by preset id.
 *
 * @alpha
 */
export const CSV_DELIMITER_PRESETS = {
    comma: { delimiter: ",", previewSymbol: "," },
    semicolon: { delimiter: ";", previewSymbol: ";" },
    pipe: { delimiter: "|", previewSymbol: "|" },
    tab: { delimiter: "\t", previewSymbol: "⇥" },
} as const;

/**
 * Identifier of the default CSV delimiter preset.
 *
 * @alpha
 */
export const DEFAULT_CSV_DELIMITER_PRESET_ID = "comma";

/**
 * The default CSV delimiter character (comma).
 *
 * @alpha
 */
export const DEFAULT_CSV_DELIMITER = CSV_DELIMITER_PRESETS[DEFAULT_CSV_DELIMITER_PRESET_ID].delimiter;

const SUPPORTED_CSV_DELIMITER_REGEXP = /^[\t !#$%&()*+\-.,/:;<=>?@\[\]\\^_{|}~]$/;

/**
 * Identifier of a built-in CSV delimiter preset.
 *
 * @alpha
 */
export type CsvDelimiterPresetId = keyof typeof CSV_DELIMITER_PRESETS;

/**
 * Identifier of a CSV delimiter preset, "custom" when the user provides their own character,
 * or "inherit" when no delimiter should be sent and the backend-resolved default should apply.
 *
 * @remarks
 * "custom" and "inherit" are sentinels with no delimiter character of their own; only
 * {@link CsvDelimiterPresetId} members are valid keys into {@link CSV_DELIMITER_PRESETS}.
 *
 * @alpha
 */
export type CsvDelimiterPreset = CsvDelimiterPresetId | "custom" | "inherit";

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
 * or `"inherit"` when the delimiter is `undefined` or an empty string.
 *
 * @param delimiter - delimiter character to look up; `undefined` or empty resolves to `"inherit"`
 * @returns the matching preset id, `"custom"`, or `"inherit"`
 * @alpha
 */
export function getCsvDelimiterPreset(delimiter?: string): CsvDelimiterPreset {
    let id: CsvDelimiterPresetId;
    for (id in CSV_DELIMITER_PRESETS) {
        if (CSV_DELIMITER_PRESETS[id].delimiter === delimiter) {
            return id;
        }
    }

    return delimiter ? "custom" : "inherit";
}

/**
 * Returns the actual delimiter character for a given preset selection.
 *
 * When the preset is `"custom"`, the provided custom delimiter string is returned as-is.
 * When the preset is `"inherit"`, `undefined` is returned so the `delimiter` field is omitted
 * from the saved settings, letting the backend-resolved default (workspace or organization
 * setting) apply instead.
 *
 * @param selectedPreset - the selected preset identifier
 * @param customDelimiter - the user-provided custom delimiter (used only when preset is `"custom"`)
 * @returns the resolved delimiter character, or `undefined` when the preset is `"inherit"`
 * @alpha
 */
export function getCsvDelimiterValue(
    selectedPreset: CsvDelimiterPreset,
    customDelimiter: string,
): string | undefined {
    if (selectedPreset === "inherit") {
        return undefined;
    }

    if (selectedPreset === "custom") {
        return customDelimiter;
    }

    return CSV_DELIMITER_PRESETS[selectedPreset].delimiter;
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
