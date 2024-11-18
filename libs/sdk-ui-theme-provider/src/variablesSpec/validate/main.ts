// (C) 2024 GoodData Corporation
import chalk from "chalk";
import { logError, logInfo, logSuccess } from "./log.js";
import { parseCssContentToVariableUsages } from "./parse.js";
import { validateAllVariableUsages } from "./validate.js";

/**
 * Validate CSS file content against all variables specification.
 *
 * @internal
 */
export function validateCss(cssFilePath: string, cssFileContent: string) {
    try {
        logInfo(`Starting to validate CSS variable usages in ${cssFilePath}`);

        // Collect all variable usages with their default values in the CSS file
        const allVariableUsages = parseCssContentToVariableUsages(cssFilePath, cssFileContent);

        // Collect all validation errors
        const { failed } = validateAllVariableUsages(allVariableUsages);

        // Log all validation errors
        for (const failedValidation of failed) {
            logError(failedValidation.error);
        }

        // Throw if there are any validation errors
        if (failed.length > 0) {
            throw new Error(`${failed.length} errors found in ${cssFilePath}`);
        }

        // Log success
        logSuccess(`All ${allVariableUsages.length} CSS variable usages in ${cssFilePath} are valid!`);
    } catch (error) {
        // Log error
        if (error instanceof Error) {
            console.error(chalk.red(error.message));
        } else {
            console.error(chalk.red(error));
        }

        // Throw if there are any validation errors
        throw error;
    }
}
