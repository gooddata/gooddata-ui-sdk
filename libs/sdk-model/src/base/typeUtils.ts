// (C) 2024-2026 GoodData Corporation

/**
 * Tolerant exhaustiveness check for discriminated unions: logs the unhandled member and returns.
 * Throwing counterpart: {@link throwUnexpected}.
 *
 * @internal
 */
export const assertNever = (value: never) => {
    console.error(`Unhandled discriminated union member: ${value}`);
};

/**
 * Throwing exhaustiveness check for discriminated unions: the `never` parameter fails the build on an
 * unhandled case, and the throw guards runtime values the compiler cannot see. Counterpart: {@link assertNever}.
 *
 * @internal
 */
export const throwUnexpected = (value: never): never => {
    throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
};
