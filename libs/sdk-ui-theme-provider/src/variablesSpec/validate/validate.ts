// (C) 2024-2026 GoodData Corporation

import { type CssVariableUsage } from "./types.js";
import { groupByUnique } from "./utils.js";
import { allThemeCssVariables } from "../allThemeCssVariables.js";
import {
    type ThemeCssVariable,
    type ThemeDefinedCssVariable,
    type ThemeDeprecatedCssVariable,
    type ThemeDerivedCssVariable,
    type ThemeInconsistentCssVariable,
    type ThemeInternalCssVariable,
} from "../types.js";

/**
 * Validation that was skipped.
 * @internal
 */
type SkipValidationResult = {
    type: "skip";
    variableUsage: CssVariableUsage;
    variableSpecification: ThemeCssVariable | undefined;
};

/**
 * Validation that was successful.
 * @internal
 */
type OkValidationResult = {
    type: "ok";
    variableUsage: CssVariableUsage;
    variableSpecification: ThemeCssVariable;
};

/**
 * Validation that failed.
 * @internal
 */
type ErrorValidationResult = {
    type: "error";
    error: string;
    variableUsage: CssVariableUsage;
    variableSpecification?: ThemeCssVariable;
};

/**
 * Any possible validation result.
 * @internal
 */
type ValidationResult = SkipValidationResult | OkValidationResult | ErrorValidationResult;

/**
 * Validate all variable usages against their specifications and return the results.
 * @internal
 */
export function validateAllVariableUsages(allVariableUsages: CssVariableUsage[]) {
    // Group all specifications by variable name
    const variableSpecificationByVariableName = groupByUnique(allThemeCssVariables, (v) => v.variableName);

    const failed: ErrorValidationResult[] = [];
    const skipped: SkipValidationResult[] = [];
    const success: OkValidationResult[] = [];

    for (const variableUsage of allVariableUsages) {
        // Get specification relevant for the CSS variable usage
        const variableSpecification =
            variableSpecificationByVariableName[
                variableUsage.variableName as keyof typeof variableSpecificationByVariableName
            ];

        // Validate the CSS variable usage against the specification
        const validationResult = validateVariableUsage(variableUsage, variableSpecification);

        if (validationResult.type === "skip") {
            skipped.push(validationResult);
        } else if (validationResult.type === "error") {
            failed.push(validationResult);
        } else if (validationResult.type === "ok") {
            success.push(validationResult);
        } else {
            throw new Error(`Unhandled validation result: ${JSON.stringify(validationResult, null, 2)}`);
        }
    }

    const allValidationsCount = failed.length + skipped.length + success.length;

    if (allValidationsCount !== allVariableUsages.length) {
        throw new Error(
            `Validations count ${allValidationsCount} does not match the number of variable usages ${allVariableUsages.length}`,
        );
    }

    return {
        failed,
        skipped,
        success,
        allValidationsCount,
    };
}

/**
 * Validate variable usage, according to its specification.
 */
function validateVariableUsage(
    variableUsage: CssVariableUsage,
    variableSpecification?: ThemeCssVariable,
): ValidationResult {
    if (!variableSpecification) {
        if (variableUsage.variableName.startsWith("--gd")) {
            return errorValidationResult(
                `Variable specification for ${variableUsage.variableName} is missing! Used value: ${variableUsage.defaultValue}`,
                variableUsage,
            );
        } else {
            // Do not validate external variables
            return skippedValidationResult(variableUsage, variableSpecification);
        }
    }

    if (variableSpecification.type === "deprecated") {
        return validateDeprecatedVariableUsage(variableUsage, variableSpecification);
    } else if (variableSpecification.type === "inconsistent") {
        return validateInconsistentVariableUsage(variableUsage, variableSpecification);
    } else if (["theme", "derived", "internal"].includes(variableSpecification.type)) {
        return validateThemeVariableUsage(variableUsage, variableSpecification);
    }

    throw new Error(
        `Unhandled exception: ${JSON.stringify(variableUsage, null, 2)} ${JSON.stringify(
            variableSpecification,
            null,
            2,
        )}`,
    );
}

/**
 * Deprecated variable usage validation.
 * It should:
 * - not be used in the CSS
 */
function validateDeprecatedVariableUsage(
    variableUsage: CssVariableUsage,
    variableSpecification: ThemeDeprecatedCssVariable,
): ValidationResult {
    return errorValidationResult(
        `CSS variable ${variableUsage.variableName} is deprecated, but found in the CSS!`,
        variableUsage,
        variableSpecification,
    );
}

/**
 * Inconsistent variable usage validation.
 * It should either:
 * - not have default value specified in the CSS
 * - have default value that matches inconsistent defaults in the specification
 */
function validateInconsistentVariableUsage(
    variableUsage: CssVariableUsage,
    variableSpecification: ThemeInconsistentCssVariable,
): ValidationResult {
    if (!variableUsage.defaultValue) {
        return skippedValidationResult(variableUsage, variableSpecification);
    } else if (
        !variableSpecification.inconsistentDefaults.some(
            (d) =>
                variableUsage.defaultValue &&
                normalizeCssVariableValue(d) === normalizeCssVariableValue(variableUsage.defaultValue),
        )
    ) {
        return errorValidationResult(
            `CSS variable ${normalizeCssVariableValue(
                variableUsage.variableName,
            )} has default value ${normalizeCssVariableValue(
                variableUsage.defaultValue,
            )}, which is missing in the specification!`,
            variableUsage,
            variableSpecification,
        );
    }

    return okValidationResult(variableUsage, variableSpecification);
}

/**
 * Theme variable usage validation.
 * It should either:
 * - be skipped (when skipDefaultValueValidation is set to true in the specification)
 * - not have default value specified in the CSS
 * - have default value that matches default value in the specification
 */
function validateThemeVariableUsage(
    variableUsage: CssVariableUsage,
    variableSpecification: ThemeDefinedCssVariable | ThemeDerivedCssVariable | ThemeInternalCssVariable,
): ValidationResult {
    if (
        "skipDefaultValueValidation" in variableSpecification &&
        variableSpecification.skipDefaultValueValidation
    ) {
        return skippedValidationResult(variableUsage, variableSpecification);
    } else if (
        variableSpecification.defaultValue !== null &&
        variableUsage.defaultValue !== null &&
        normalizeCssVariableValue(variableUsage.defaultValue) !==
            normalizeCssVariableValue(variableSpecification.defaultValue)
    ) {
        return errorValidationResult(
            `Css variable ${
                variableUsage.variableName
            } has different default value ${normalizeCssVariableValue(
                variableUsage.defaultValue,
            )} in the CSS than in the specification ${normalizeCssVariableValue(
                variableSpecification.defaultValue,
            )}!`,
            variableUsage,
            variableSpecification,
        );
    }

    return okValidationResult(variableUsage, variableSpecification);
}

/**
 * Validation result that was skipped.
 */
function skippedValidationResult(
    variableUsage: CssVariableUsage,
    variableSpecification?: ThemeCssVariable,
): SkipValidationResult {
    return { type: "skip", variableUsage, variableSpecification };
}

/**
 * Validation result that was successful.
 */
function okValidationResult(
    variableUsage: CssVariableUsage,
    variableSpecification: ThemeCssVariable,
): OkValidationResult {
    return { type: "ok", variableUsage, variableSpecification };
}

/**
 * Validation result that failed.
 */
function errorValidationResult(
    error: string,
    variableUsage: CssVariableUsage,
    variableSpecification?: ThemeCssVariable,
): ErrorValidationResult {
    return { type: "error", error, variableUsage, variableSpecification };
}

/**
 * Minified CSS can have 0. replaced with ., and missing white spaces, so we need to normalize the value.
 * Also normalizes color values to handle rgba/hex equivalence.
 */
function normalizeCssVariableValue(value: string) {
    // First normalize whitespace and leading zeros
    let normalized = value.replace("0.", ".").replace(/\s+/g, "");

    // Normalize all color values in the string (handles nested var() with colors)
    normalized = normalizeColorsInValue(normalized);

    return normalized;
}

/**
 * CSS named colors that minifiers might use (maps to rgba values).
 * Only includes colors likely to appear in our codebase.
 */
const CSS_NAMED_COLORS: Record<string, string> = {
    gray: "rgba(128,128,128,1)",
    grey: "rgba(128,128,128,1)",
    white: "rgba(255,255,255,1)",
    black: "rgba(0,0,0,1)",
    red: "rgba(255,0,0,1)",
    green: "rgba(0,128,0,1)",
    blue: "rgba(0,0,255,1)",
    transparent: "rgba(0,0,0,0)",
    inherit: "inherit",
    initial: "initial",
};

/**
 * Normalize all color values in a CSS value string.
 * Converts rgba(), hex colors, and named colors to a canonical rgba() format for comparison.
 */
function normalizeColorsInValue(value: string): string {
    let result = value;

    // Convert CSS named colors to rgba (must be done first, before other replacements)
    for (const [name, rgba] of Object.entries(CSS_NAMED_COLORS)) {
        // Handle exact match (standalone color name)
        if (result.toLowerCase() === name.toLowerCase()) {
            result = rgba;
            break;
        }
        // Match named color in context (preceded by comma/paren, followed by paren/comma/end)
        const pattern = new RegExp(`(,|\\()${name}(\\)|,|$)`, "gi");
        result = result.replace(pattern, `$1${rgba}$2`);
    }

    // Convert 8-digit hex colors to rgba
    result = result.replace(
        /#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})\b/g,
        (_match, r: string, g: string, b: string, a: string) => {
            const red = parseInt(r, 16);
            const green = parseInt(g, 16);
            const blue = parseInt(b, 16);
            const alpha = parseInt(a, 16) / 255;
            // Round alpha to 2 decimal places to match typical rgba precision
            const alphaRounded = Math.round(alpha * 100) / 100;
            return `rgba(${red},${green},${blue},${alphaRounded})`;
        },
    );

    // Normalize rgba() values to consistent format (no spaces, consistent decimal)
    result = result.replace(
        /rgba\((\d+),(\d+),(\d+),([\d.]+)\)/g,
        (_match, r: string, g: string, b: string, a: string) => {
            const alpha = parseFloat(a);
            // Round alpha to 2 decimal places for consistent comparison
            const alphaRounded = Math.round(alpha * 100) / 100;
            return `rgba(${r},${g},${b},${alphaRounded})`;
        },
    );

    // Convert 6-digit hex to rgba (fully opaque)
    result = result.replace(
        /#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})\b/g,
        (_match, r: string, g: string, b: string) => {
            const red = parseInt(r, 16);
            const green = parseInt(g, 16);
            const blue = parseInt(b, 16);
            return `rgba(${red},${green},${blue},1)`;
        },
    );

    return result;
}
