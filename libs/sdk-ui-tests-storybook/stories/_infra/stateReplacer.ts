// (C) 2007-2026 GoodData Corporation

/**
 * Helper to convert JSON state strings to State enum references.
 * Transforms `"state":"attached"` to `"state": State.Attached` etc.
 */
export function replaceStateInJson(json: string): string {
    return json.replace(/"state":"([a-z]+)"/g, (_, v: string) => {
        const capitalized = v.charAt(0).toUpperCase() + v.slice(1);
        return '"state": State.' + capitalized;
    });
}

/**
 * Helper to remove quotes around State enum references in JSON.
 * Transforms `"state": "State.Attached"` to `"state": State.Attached` etc.
 */
export function unquoteStateInJson(json: string): string {
    return json.replace(/"State\.([A-Za-z]+)"/g, "State.$1");
}
