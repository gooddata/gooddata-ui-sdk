// (C) 2024 GoodData Corporation
import chalk from "chalk";

/**
 * @internal
 */
export function logError(message: string | unknown) {
    console.error(chalk.red(message));
}

/**
 * @internal
 */
export function logSuccess(message: string) {
    // eslint-disable-next-line no-console
    console.log(chalk.green(message));
}

/**
 * @internal
 */
export function logInfo(message: string) {
    // eslint-disable-next-line no-console
    console.log(chalk.gray(message));
}

/**
 * @internal
 */
export function errorParsingFile(filePath: string, error: unknown) {
    logError(`Failed to parse file: ${filePath}`);
    logError(error);
}
