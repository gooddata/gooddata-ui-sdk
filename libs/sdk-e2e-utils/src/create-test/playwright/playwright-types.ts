// (C) 2026 GoodData Corporation

import type {
    PlaywrightTestArgs,
    PlaywrightTestOptions,
    PlaywrightWorkerArgs,
    PlaywrightWorkerOptions,
    test,
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
export type PlaywrightTest = typeof test;

/**
 * @internal
 */
export type PlaywrightDescribeConfigure = typeof test.describe.configure;

/**
 * @internal
 */
export type PlaywrightDescribeSerial = typeof test.describe.serial;

/**
 * @internal
 */
export type PlaywrightDescribeParallel = typeof test.describe.parallel;
