// (C) 2025 GoodData Corporation

import { ClientFormatterFacade, type ISeparators } from "@gooddata/number-formatter";

const DEFAULT_SAMPLE_VALUE = 12345.67;
const DEFAULT_REQUIRED_DECIMALS = 2;
const SECTION_SEPARATOR = ";";
const NUMBER_PLACEHOLDER_PATTERN = /[0#?]/;
const DECIMAL_TOKEN_PATTERN = /\.(0+)/;
const CURRENCY_SYMBOL_PATTERN = /\p{Sc}/u;
const CURRENCY_BRACKET_PATTERN = /\[\$[^\]]+\]/;
const QUOTED_CURRENCY_PATTERN = /(["'])[ \t]*[A-Za-z]{2,6}[ \t]*\1/;

/**
 * @alpha
 */
export type CurrencyFormatValidationErrorCode =
    | "empty"
    | "invalidFormat"
    | "missingCurrencySymbol"
    | "missingDecimalPlaces";

/**
 * @alpha
 */
export interface ICurrencyFormatValidationError {
    code: CurrencyFormatValidationErrorCode;
    /**
     * Indexes of sections (0-based) that failed validation.
     * The value is only present for section-driven validations.
     */
    sectionIndexes?: number[];
    message: string;
}

/**
 * @alpha
 */
export interface ICurrencyFormatValidationResult {
    isValid: boolean;
    errors: ICurrencyFormatValidationError[];
}

/**
 * @alpha
 */
export interface ICurrencyFormatValidationOptions {
    /**
     * Sample value used to verify the formatter does not throw.
     * Defaults to 12345.67 to cover both thousands and decimals.
     */
    sampleValue?: number;
    /**
     * Number of mandatory decimal places each section must contain.
     * Set to 0 (or a negative value) to skip the decimal check.
     * Defaults to 2.
     */
    requiredDecimalPlaces?: number;
    separators?: ISeparators;
}

const DEFAULT_ERROR_MESSAGES: Record<CurrencyFormatValidationErrorCode, string> = {
    empty: "Format is required.",
    invalidFormat: "Format contains invalid tokens.",
    missingCurrencySymbol: "Currency symbol is missing.",
    missingDecimalPlaces: "Format must include the required decimal places.",
};

/**
 * Validates a number format string that is expected to represent a currency amount.
 *
 * @alpha
 */
export function validateCurrencyFormat(
    format: string | undefined | null,
    options: ICurrencyFormatValidationOptions = {},
): ICurrencyFormatValidationResult {
    const sanitizedFormat = format?.trim() ?? "";
    const errors: ICurrencyFormatValidationError[] = [];

    if (!sanitizedFormat) {
        errors.push(buildError("empty"));
        return { isValid: false, errors };
    }

    const sampleValue = options.sampleValue ?? DEFAULT_SAMPLE_VALUE;
    const separators = options.separators;

    if (!isParsableFormat(sanitizedFormat, sampleValue, separators)) {
        errors.push(buildError("invalidFormat"));
        return { isValid: false, errors };
    }

    const sections = getFormatSections(sanitizedFormat);
    const sectionsWithNumbers = sections.filter(hasNumericPlaceholder);

    if (sectionsWithNumbers.length === 0) {
        errors.push(buildError("invalidFormat"));
        return { isValid: false, errors };
    }

    if (!sectionsWithNumbers.every(hasCurrencyToken)) {
        errors.push(
            buildError(
                "missingCurrencySymbol",
                collectInvalidSections(sectionsWithNumbers, hasCurrencyToken),
            ),
        );
    }

    const requiredDecimals = options.requiredDecimalPlaces ?? DEFAULT_REQUIRED_DECIMALS;

    if (
        requiredDecimals > 0 &&
        !sectionsWithNumbers.every((section) => hasRequiredDecimals(section, requiredDecimals))
    ) {
        errors.push(
            buildError(
                "missingDecimalPlaces",
                collectInvalidSections(sectionsWithNumbers, (section) =>
                    hasRequiredDecimals(section, requiredDecimals),
                ),
            ),
        );
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

function buildError(
    code: CurrencyFormatValidationErrorCode,
    sectionIndexes?: number[],
): ICurrencyFormatValidationError {
    return {
        code,
        sectionIndexes,
        message: DEFAULT_ERROR_MESSAGES[code],
    };
}

function getFormatSections(format: string): string[] {
    return format
        .split(SECTION_SEPARATOR)
        .map((section) => section.trim())
        .filter((section) => section.length > 0);
}

function hasNumericPlaceholder(section: string): boolean {
    return NUMBER_PLACEHOLDER_PATTERN.test(section);
}

function hasCurrencyToken(section: string): boolean {
    return (
        CURRENCY_BRACKET_PATTERN.test(section) ||
        CURRENCY_SYMBOL_PATTERN.test(section) ||
        QUOTED_CURRENCY_PATTERN.test(section)
    );
}

function hasRequiredDecimals(section: string, requiredDecimalPlaces: number): boolean {
    const match = section.match(DECIMAL_TOKEN_PATTERN);
    if (!match) {
        return false;
    }

    return match[1].length >= requiredDecimalPlaces;
}

function collectInvalidSections(
    sections: string[],
    predicate: (section: string) => boolean,
): number[] | undefined {
    const invalidIndexes = sections.reduce<number[]>((result, section, index) => {
        if (!predicate(section)) {
            result.push(index);
        }
        return result;
    }, []);

    return invalidIndexes.length > 0 ? invalidIndexes : undefined;
}

function isParsableFormat(format: string, sampleValue: number, separators?: ISeparators): boolean {
    try {
        ClientFormatterFacade.formatValue(sampleValue, format, separators);
        return true;
    } catch {
        return false;
    }
}

/**
 * Checks if a format string represents a currency format.
 * A currency format is one where at least one numeric section contains a currency symbol.
 *
 * @alpha
 */
export function isCurrencyFormat(format: string | undefined | null): boolean {
    const sanitizedFormat = format?.trim();
    if (!sanitizedFormat) {
        return false;
    }

    const sections = getFormatSections(sanitizedFormat);
    const sectionsWithNumbers = sections.filter(hasNumericPlaceholder);

    if (sectionsWithNumbers.length === 0) {
        return false;
    }

    return sectionsWithNumbers.some(hasCurrencyToken);
}
