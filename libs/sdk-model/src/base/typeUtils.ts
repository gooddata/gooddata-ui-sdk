// (C) 2024-2026 GoodData Corporation

/**
 * Tolerant exhaustiveness check for discriminated unions: logs the unhandled member and returns.
 * Throwing counterpart: {@link throwUnexpected}.
 *
 * @internal
 */
export const assertNever = (value: never) => {
    console.error(`Unhandled discriminated union member: ${safeStringify(value)}`);
};

/**
 * Throwing exhaustiveness check for discriminated unions: the `never` parameter fails the build on an
 * unhandled case, and the throw guards runtime values the compiler cannot see. Counterpart: {@link assertNever}.
 *
 * @internal
 */
export const throwUnexpected = (value: never): never => {
    throw new Error(`Unexpected value: ${safeStringify(value)}`);
};

/**
 * JSON.stringify wrapper that never throws (e.g. on circular references, or values whose
 * serialization/coercion hooks themselves throw), so logging an unexpected value can't
 * itself crash the caller.
 */
function safeStringify(value: unknown): string {
    try {
        // JSON.stringify returns undefined (not a throw) for functions/symbols/undefined;
        // String() covers those without risk, since we only reach it when JSON.stringify
        // itself didn't throw.
        return JSON.stringify(value) ?? String(value);
    } catch {
        return "<unserializable value>";
    }
}
