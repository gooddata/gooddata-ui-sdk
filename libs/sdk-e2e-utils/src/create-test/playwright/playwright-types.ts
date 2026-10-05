// (C) 2026 GoodData Corporation

// oxlint-disable no-barrel-files/no-barrel-files

import type {
    PlaywrightTestArgs,
    PlaywrightTestOptions,
    TestType as PlaywrightTestType,
    PlaywrightWorkerArgs,
    PlaywrightWorkerOptions,
    TestInfo,
} from "@playwright/test";

/**
 * @internal
 */
export type PlaywrightBaseTestArgs = PlaywrightTestArgs & PlaywrightTestOptions;

/**
 * @internal
 */
export type PlaywrightBaseWorkerArgs = PlaywrightWorkerArgs & PlaywrightWorkerOptions;

/**
 * @internal
 */
export type { PlaywrightTestType };

/**
 * @internal
 */
export type PlaywrightTestInstance = PlaywrightTestType<
    PlaywrightTestArgs & PlaywrightTestOptions,
    PlaywrightWorkerArgs & PlaywrightWorkerOptions
>;

/**
 * @internal
 */
export type PlaywrightDescribeConfigure = PlaywrightTestInstance["describe"]["configure"];

/**
 * @internal
 * Body of a test: `(fixtures, testInfo) => ...`. Mirrors Playwright's internal `TestBody<TestArgs>`,
 * which `@playwright/test` doesn't export.
 */
export type PlaywrightTestBody<TestArgs> = (args: TestArgs, testInfo: TestInfo) => Promise<unknown> | unknown;

/**
 * @internal
 * Condition callback of `test.skip(callback, description?)` and friends. Mirrors Playwright's internal
 * `ConditionBody<TestArgs>`, which `@playwright/test` doesn't export.
 */
export type PlaywrightConditionBody<TestArgs> = (args: TestArgs) => boolean;
