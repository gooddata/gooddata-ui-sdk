// (C) 2026 GoodData Corporation

// oxlint-disable typescript/no-empty-object-type

import type { Fixtures, TestDetails } from "@playwright/test";

import type { IFeatureHubEnvironment } from "../feature-hub/types.js";
import type { IGoodmockOptions } from "../goodmock/types.js";

import type {
    PlaywrightConditionBody,
    PlaywrightDescribeConfigure,
    PlaywrightTestBody,
    PlaywrightTestType,
} from "./playwright-types.js";

/**
 * @internal
 */
export type Callback = () => void;

/**
 * @internal
 * Call signatures of the overridden `test.describe` and its variants (`.only`, `.skip`, `.fixme`, `.serial`, `.parallel`, ...).
 * The outermost describe of a spec file also sets up the spec (FeatureHub mock, goodmock hooks).
 */
export interface IDescribeFunction<TestConditionsValue extends TestConditionsValueConstraint = never> {
    (title: string, details: ITestDetails<TestConditionsValue>, callback: Callback): void;
}

/**
 * @internal
 * `test.describe.serial` / `test.describe.parallel`, with their `.only`.
 */
export interface IDescribeModeFunction<
    TestConditionsValue extends TestConditionsValueConstraint = never,
> extends IDescribeFunction<TestConditionsValue> {
    only: IDescribeFunction<TestConditionsValue>;
}

/**
 * @internal
 */
export interface IDescribe<
    TestConditionsValue extends TestConditionsValueConstraint = never,
> extends IDescribeFunction<TestConditionsValue> {
    skip: IDescribeFunction<TestConditionsValue>;
    only: IDescribeFunction<TestConditionsValue>;
    configure: PlaywrightDescribeConfigure;
    fixme: IDescribeFunction<TestConditionsValue>;
    serial: IDescribeModeFunction<TestConditionsValue>;
    parallel: IDescribeModeFunction<TestConditionsValue>;
}

/**
 * @internal
 * Allowed types for the consumer's conditions value: objects (including arrays), strings and numbers.
 * Not `boolean`, `null` or `undefined` (nor unions containing them). Only the top level is restricted,
 * an object may contain booleans. Without conditions configured, the conditions type is `never`.
 */
export type TestConditionsValueConstraint = object | string | number;

/**
 * @internal
 * Context passed to {@link ITestConditions.shouldRun}, for the test being registered.
 */
export interface ITestConditionsContext {
    /** Absolute path of the spec file. */
    file: string;
    /** Titles of the enclosing describes, outermost first, followed by the test's own title. */
    titlePath: string[];
}

/**
 * @internal
 * Consumer-defined conditions deciding which tests run. `TestConditionsValue` is the consumer's own type (e.g. a list
 * of products). Describes and tests set it via `details.conditions`; nested values are combined with
 * {@link ITestConditions.merge}. Each test is evaluated once, while tests are being registered.
 */
export interface ITestConditions<TestConditionsValue extends TestConditionsValueConstraint> {
    /**
     * Whether a test with these (already combined) conditions runs. When `false`, the test is registered
     * as skipped. Not called when neither the test nor any enclosing describe sets conditions.
     *
     * Called while tests are being registered, in every Playwright process: it must be synchronous and
     * return the same answer every time (env vars and config are fine; async or runtime state are not).
     */
    shouldRun: (conditions: TestConditionsValue, context: ITestConditionsContext) => boolean;
    /**
     * Combine a describe's or test's conditions with those inherited from its enclosing describes.
     * Defaults to `child` replacing `parent`.
     */
    merge?: (parent: TestConditionsValue | undefined, child: TestConditionsValue) => TestConditionsValue;
    /**
     * When `true`, every test must end up with conditions: set on the test itself or inherited from an
     * enclosing describe. Registering a test without any throws. Defaults to `false`.
     */
    required?: boolean;
}

/**
 * @internal
 */
export interface ICustomCreateTestOptions<TestConditionsValue extends TestConditionsValueConstraint = never> {
    featureHubResponse: IFeatureHubEnvironment[];
    goodmock?: IGoodmockOptions;
    testConditions?: ITestConditions<TestConditionsValue>;
}

/**
 * @internal
 * `testConditions` is required when the conditions type `TestConditionsValue` is given (or inferred from it).
 */
export type ICreateTestOptions<
    TestConditionsValue extends TestConditionsValueConstraint = never,
    T extends {} = {},
    W extends {} = {},
> = ICustomCreateTestOptions<TestConditionsValue> & {
    fixtures?: Fixtures<T, W>;
} & ([TestConditionsValue] extends [never] ? {} : { testConditions: ITestConditions<TestConditionsValue> });

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
export interface ITestDetails<
    TestConditionsValue extends TestConditionsValueConstraint = never,
> extends TestDetails {
    workspaceSettings?: WorkspaceSettings;
    additionalWindowProperties?: WindowProperties;
    /** See {@link ITestConditions}. */
    conditions?: TestConditionsValue;
}

/**
 * @internal
 * Call signatures that register a test: `test`, `test.only`, `test.fail.only`.
 * Same as Playwright's, except `details` also accepts `workspaceSettings` / `additionalWindowProperties` / `conditions`.
 */
export interface ITestFunction<
    TestConditionsValue extends TestConditionsValueConstraint,
    TestArgs extends {},
    WorkerArgs extends {},
> {
    (title: string, body: PlaywrightTestBody<TestArgs & WorkerArgs>): void;
    (
        title: string,
        details: ITestDetails<TestConditionsValue>,
        body: PlaywrightTestBody<TestArgs & WorkerArgs>,
    ): void;
}

/**
 * @internal
 * `test.skip` / `test.fixme`: register a skipped test (title forms), or mark the current test or describe.
 */
export interface ITestModifierFunction<
    TestConditionsValue extends TestConditionsValueConstraint,
    TestArgs extends {},
    WorkerArgs extends {},
> extends ITestFunction<TestConditionsValue, TestArgs, WorkerArgs> {
    (): void;
    (condition: boolean, description?: string): void;
    (callback: PlaywrightConditionBody<TestArgs & WorkerArgs>, description?: string): void;
}

/**
 * @internal
 * `test.fail`, with its `.only`.
 */
export interface ITestFailFunction<
    TestConditionsValue extends TestConditionsValueConstraint,
    TestArgs extends {},
    WorkerArgs extends {},
> extends ITestModifierFunction<TestConditionsValue, TestArgs, WorkerArgs> {
    only: ITestFunction<TestConditionsValue, TestArgs, WorkerArgs>;
}

/**
 * @internal
 * Playwright's `TestType<TestArgs, WorkerArgs>`, with our `test` / `only` / `skip` / `fixme` / `fail` / `describe`.
 */
export type Test<
    TestConditionsValue extends TestConditionsValueConstraint,
    TestArgs extends {},
    WorkerArgs extends {},
> = ITestFunction<TestConditionsValue, TestArgs, WorkerArgs> &
    Omit<PlaywrightTestType<TestArgs, WorkerArgs>, "only" | "skip" | "fixme" | "fail" | "describe"> & {
        only: ITestFunction<TestConditionsValue, TestArgs, WorkerArgs>;
        skip: ITestModifierFunction<TestConditionsValue, TestArgs, WorkerArgs>;
        fixme: ITestModifierFunction<TestConditionsValue, TestArgs, WorkerArgs>;
        fail: ITestFailFunction<TestConditionsValue, TestArgs, WorkerArgs>;
        describe: IDescribe<TestConditionsValue>;
    };
