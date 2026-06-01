// (C) 2026 GoodData Corporation

import { isProduction } from "./lib/isProduction.js";

/**
 * Logs a debug message to the console, but only in non-production builds.
 */
export function debugLog(message: string, ...args: unknown[]): void {
    if (!isProduction) {
        // eslint-disable-next-line no-console
        console.debug(message, ...args);
    }
}

/**
 * Returns a high-resolution timestamp in milliseconds, using the Performance API
 * when available and falling back to Date.now().
 */
export function now(): number {
    return typeof performance === "undefined" ? Date.now() : performance.now();
}
