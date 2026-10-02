// (C) 2026 GoodData Corporation

// oxlint-disable typescript/no-empty-object-type

import type { Fixtures, TestDetails } from "@playwright/test";

import type { IFeatureHubEnvironment } from "../feature-hub/types.js";
import type { IGoodmockOptions } from "../goodmock/types.js";

import type {
    PlaywrightDescribeConfigure,
    PlaywrightDescribeParallel,
    PlaywrightDescribeSerial,
    PlaywrightTest,
} from "./playwright-types.js";

/**
 * @internal
 */
export type Callback = () => void;

/**
 * @internal
 * Call signatures of the overridden `test.describe`, `test.describe.only`, `test.describe.skip` and `test.describe.fixme`.
 */
export interface IDescribeFunction {
    (title: string, details: ITestDetails, callback: Callback): void;
}

/**
 * @internal
 */
export interface IDescribe extends IDescribeFunction {
    skip: IDescribeFunction;
    only: IDescribeFunction;
    configure: PlaywrightDescribeConfigure;
    fixme: IDescribeFunction;
    serial: PlaywrightDescribeSerial;
    parallel: PlaywrightDescribeParallel;
}

/**
 * @internal
 * Call signatures of the overridden `test.describe` and `test.describe.skip`.
 */
export interface ITopLevelDescribeFunction {
    (suiteName: string, specName: string, details: ITestDetails, fn: Callback): void;
}

/**
 * @internal
 */
export interface ITopLevelDescribe extends ITopLevelDescribeFunction {
    skip: ITopLevelDescribeFunction;
    // TODO: implement the following
    //  only: ITopLevelDescribeFunction;
    //  configure: ITopLevelDescribeFunction;
    //  fixme: ITopLevelDescribeFunction;
    //  serial: ITopLevelDescribeFunction;
    //  parallel: ITopLevelDescribeFunction;
}

/**
 * @internal
 */
export interface ICustomCreateTestOptions {
    featureHubResponse: IFeatureHubEnvironment[];
    goodmock?: IGoodmockOptions;
}

/**
 * @internal
 */
export interface ICreateTestOptions<T extends {} = {}, W extends {} = {}> extends ICustomCreateTestOptions {
    fixtures?: Fixtures<T, W>;
}

/**
 * @internal
 */
export type WorkspaceSettings = Record<string, unknown>;

/**
 * @internal
 */
export type WindowProperties = Record<string, unknown>;

/**
 * @internal
 */
export interface ITestDetails extends TestDetails {
    workspaceSettings?: WorkspaceSettings;
    additionalWindowProperties?: WindowProperties;
}

/**
 * @internal
 * Keep only the call signatures of an overloaded function type (Playwright's `test` has exactly two).
 */
export type CallSignatures<F> = F extends { (...args: infer A1): infer R1; (...args: infer A2): infer R2 }
    ? { (...args: A1): R1; (...args: A2): R2 }
    : never;

/**
 * @internal
 * Like `T & U`, but properties in `U` replace those in `T` instead of merging, and `T` stays callable.
 */
export type Override<T, U> = CallSignatures<T> & Omit<T, keyof U> & U;

/**
 * @internal
 */
export type Test = Override<
    PlaywrightTest,
    {
        topLevelDescribe: ITopLevelDescribe;
        describe: IDescribe;
    }
>;
