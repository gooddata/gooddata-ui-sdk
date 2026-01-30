// (C) 2026 GoodData Corporation

/**
 * Check if a key is safe to be unquoted in JS object literal.
 * Returns the key quoted or unquoted as appropriate.
 */
export function renderKey(key: string): string {
    const needsQuotes =
        /^\d/.test(key) ||
        /[^a-zA-Z0-9_$]/.test(key) ||
        [
            "class",
            "function",
            "return",
            "if",
            "else",
            "for",
            "while",
            "do",
            "switch",
            "case",
            "break",
            "continue",
            "default",
            "new",
            "delete",
            "typeof",
            "void",
            "this",
            "in",
            "instanceof",
        ].includes(key);

    return needsQuotes ? `"${key}"` : key;
}

/**
 * Recursively render any JS value to a string.
 */
export function renderValue(value: unknown, indent: number = 0): string {
    const spaces = "    ".repeat(indent);
    const innerSpaces = "    ".repeat(indent + 1);

    if (value === null) {
        return "null";
    }

    if (value === undefined) {
        return "undefined";
    }

    if (typeof value === "string") {
        return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
    }

    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }

    if (Array.isArray(value)) {
        if (value.length === 0) {
            return "[]";
        }
        const items = value.map((item) => `${innerSpaces}${renderValue(item, indent + 1)}`);
        return `[\n${items.join(",\n")},\n${spaces}]`;
    }

    if (typeof value === "object") {
        const entries = Object.entries(value as Record<string, unknown>);
        if (entries.length === 0) {
            return "{}";
        }
        const props = entries.map(
            ([key, val]) => `${innerSpaces}${renderKey(key)}: ${renderValue(val, indent + 1)}`,
        );
        return `{\n${props.join(",\n")},\n${spaces}}`;
    }

    return String(value);
}
