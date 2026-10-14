// (C) 2026 GoodData Corporation

/**
 * Quote a string value for use in RSQL filters using double quotes.
 * Escapes backslashes and embedded double quotes to prevent malformed queries.
 */
export function rsqlQuote(value: string): string {
    const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    return `"${escaped}"`;
}

/**
 * Quote a string value for use in RSQL filters using single quotes.
 * Escapes backslashes and embedded single quotes. A value without them stays byte-identical to plain quoting.
 */
export function rsqlSingleQuote(value: string): string {
    const escaped = value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    return `'${escaped}'`;
}
