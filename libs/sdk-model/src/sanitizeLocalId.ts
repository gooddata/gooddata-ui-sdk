// (C) 2021 GoodData Corporation

/**
 * Removes all non MAQL compatible characters from an identifier by replacing them with an underscore.
 * @param identifier - identifier to sanitize
 * @returns sanitized identifier
 */
export function sanitizeLocalId(identifier: string): string {
    return identifier.replace(/[^a-zA-Z0-9_.]/g, "_");
}
