// (C) 2021-2026 GoodData Corporation

/**
 * Removes all non MAQL compatible characters from an identifier by replacing them with an underscore.
 * @param identifier - identifier to sanitize
 * @returns sanitized identifier
 */
export function sanitizeLocalId(identifier: string): string {
    return identifier.replace(/[^a-z0-9_.]/gi, "_");
}
