// (C) 2026 GoodData Corporation

/**
 * Timeouts every e2e suite runs with, in milliseconds.
 */
export const E2E_TIMEOUTS = {
    /** Whole test, `timeout`. */
    test: 60_000,
    /** Single `expect`, `expect.timeout`. */
    expect: 45_000,
    /** Single action such as click or fill, `use.actionTimeout`. */
    action: 30_000,
    /** Navigation, `use.navigationTimeout`. */
    navigation: 45_000,
} as const;
