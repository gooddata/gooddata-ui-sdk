// (C) 2007-2022 GoodData Corporation
/* eslint-disable no-console */
import chalk from "chalk";

/**
 * Log an info message. Use these to communicate what the tool done, what is about to do, give additional
 * explanation and so on.
 *
 */
export function logInfo(message: string): void {
    console.log(chalk`{blue.bold 🛈} ${message}`);
}

/**
 * Log a warning. Use these to communicate that either something seems amiss (but the tool can continue) or
 * to communicate info that may be surprising (good example is --dry-run mode. end the dry run with warning
 * because user may forget/miss that she has --dry-run on CLI and may be surprised that nothing actually
 * happens)
 *
 */
export function logWarn(message: string): void {
    console.log(chalk`{blue.yellow ⚠} ${message}`);
}

/**
 * Log message communicating success. Use scarcely, typically at the end of command processing. Success message
 * may include summary info & details about the great success that just occurred. Also emojis.
 */
export function logSuccess(message: string): void {
    console.log(chalk`{white.bold.bgGreen ✔} ${message}`);
}

/**
 * Log an error. Use for validation errors and runtime errors.
 */
export function logError(message: string): void {
    console.log(chalk`{white.bold.bgRed ✘} ${message}`);
}
