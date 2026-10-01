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
export type BaseTestArgs = PlaywrightTestArgs & PlaywrightTestOptions;

/**
 * @internal
 */
export type BaseWorkerArgs = PlaywrightWorkerArgs & PlaywrightWorkerOptions;

/**
 * @internal
 */
export type Test = typeof test;

/**
 * @internal
 */
export type Describe = typeof test.describe;

/**
 * @internal
 */
export type DescribeOnly = typeof test.describe.only;

/**
 * @internal
 */
export type DescribeConfigure = typeof test.describe.configure;

/**
 * @internal
 */
export type DescribeFixme = typeof test.describe.fixme;

/**
 * @internal
 */
export type DescribeSerial = typeof test.describe.serial;

/**
 * @internal
 */
export type DescribeParallel = typeof test.describe.parallel;

/**
 * @internal
 */
export type DescribeSkip = typeof test.describe.skip;
