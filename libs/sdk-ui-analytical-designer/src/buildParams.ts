// (C) 2020-2026 GoodData Corporation

// A consumer that does not define these identifiers gets the production defaults. Builds that
// define them fold the typeof checks away.
export const IS_DEBUG: boolean = typeof DEBUG === "undefined" ? false : DEBUG;
export const IS_TESTING: boolean = typeof TESTING === "undefined" ? false : TESTING;
const IS_READONLY_MODE: boolean = typeof READONLY_MODE === "undefined" ? false : READONLY_MODE === true;

export const isReadOnlyMode = () => IS_READONLY_MODE;
