// (C) 2024 GoodData Corporation

/**
 * Assert that a value is never.
 *
 * This is utility function for exhaustive checking of discriminated unions, to ensure that all cases are handled.
 *
 * @internal
 */
export const assertNever = (value: never) => {
    console.error(`Unhandled discriminated union member: ${value}`);
};
