// (C) 2026 GoodData Corporation

// oxlint-disable typescript-eslint/no-empty-object-type

import { basename } from "path";

import { test } from "@playwright/test";

import { registerFeatureHubMock } from "../feature-hub/mock.js";
import { registerGoodmockHooks } from "../goodmock/playwright.js";

import {
    type IPlaywrightLocation,
    type PlaywrightDescribeType,
    getCallerLocation,
    getPlaywrightInternals,
} from "./playwright-internals.js";
import type {
    PlaywrightBaseTestArgs,
    PlaywrightBaseWorkerArgs,
    PlaywrightTestType,
} from "./playwright-types.js";
import {
    assertRequiredConditions,
    assertValidConditions,
    combineConditions,
    shouldRunTest,
} from "./test-conditions.js";
import { toPlaywrightDetails } from "./to-playwright-details.js";
import type {
    Callback,
    ICreateTestOptions,
    ITestDetails,
    Test,
    TestConditionsValueConstraint,
    WindowProperties,
    WorkspaceSettings,
} from "./types.js";
import { withDescribeDetails, withTestDetails } from "./with-describe-details.js";

/**
 * @internal
 * @param options -
 */
export function createTest<
    TestConditionsValue extends TestConditionsValueConstraint = never,
    T extends {} = {},
    W extends {} = {},
>(
    options: ICreateTestOptions<TestConditionsValue, T, W>,
): Test<TestConditionsValue, PlaywrightBaseTestArgs & T, PlaywrightBaseWorkerArgs & W> {
    // Tracks whether we're inside the outermost describe of a spec file during synchronous registration.
    let insideRootDescribe = false;

    // Stacks track workspace settings / additionalWindowProperties hierarchy during
    // synchronous describe registration. Each level merges on top of the parent's.
    // The beforeEach at each level captures the fully-merged snapshot, so the
    // innermost beforeEach (which runs last) wins.
    const settingsStack: WorkspaceSettings[] = [];
    const awpStack: WindowProperties[] = [];

    // Combined test conditions and titles of the enclosing describes, during synchronous registration.
    // Describes only feed these; each test decides for itself whether it runs (a describe whose own
    // conditions are false may still contain tests whose combined conditions are true).
    const { testConditions } = options;
    const conditionsStack: (TestConditionsValue | undefined)[] = [];
    const titleStack: string[] = [];

    const withDescribeScope = (title: string, details: ITestDetails<TestConditionsValue>, body: Callback) => {
        conditionsStack.push(
            combineConditions(
                testConditions,
                conditionsStack[conditionsStack.length - 1],
                details.conditions,
            ),
        );
        titleStack.push(title);
        try {
            body();
        } finally {
            titleStack.pop();
            conditionsStack.pop();
        }
    };

    // Same type `test.extend<T, W>()` returns. Without fixtures, T and W (inferred from `options.fixtures`)
    // add nothing, so the base `test` already is that type.
    const testInstance: PlaywrightTestType<PlaywrightBaseTestArgs & T, PlaywrightBaseWorkerArgs & W> =
        options.fixtures
            ? test.extend<T, W>(options.fixtures)
            : (test as unknown as PlaywrightTestType<
                  PlaywrightBaseTestArgs & T,
                  PlaywrightBaseWorkerArgs & W
              >);
    const internals = getPlaywrightInternals(testInstance);

    // specName -> spec file it was derived from. Playwright loads each file once per process, so the
    // same file again means a second outermost describe in it, and another file means a duplicate specName.
    const specNameFiles = new Map<string, string>();

    const makeDescribe = (type: PlaywrightDescribeType, name: string) => {
        const describeFunction = (
            title: string,
            details: ITestDetails<TestConditionsValue>,
            callback: Callback,
        ) => {
            const location = getCallerLocation(describeFunction);
            assertValidConditions(details.conditions, `${name}("${title}")`);
            const pwDetails = toPlaywrightDetails(details);

            if (insideRootDescribe) {
                internals.describe(type, location, title, pwDetails, () =>
                    withDescribeScope(title, details, () =>
                        withDescribeDetails(testInstance, settingsStack, awpStack, details, callback),
                    ),
                );
                return;
            }

            // Outermost describe of the spec file: it also sets up the spec.
            // "some-file-name.spec.ts" -> "some-file-name"
            const specName = basename(location.file).replace(/\.(spec|test)\.[cm]?[jt]sx?$/, "");

            const existingFile = specNameFiles.get(specName);
            if (existingFile === location.file) {
                throw new Error(
                    `${name}("${title}"): only one outermost test.describe() is allowed per file (${location.file}).`,
                );
            }
            if (existingFile !== undefined) {
                throw new Error(
                    `${name}("${title}"): duplicate specName "${specName}" in ${location.file} and ${existingFile}. Spec file names must be unique.`,
                );
            }
            specNameFiles.set(specName, location.file);

            internals.describe(type, location, title, pwDetails, () => {
                registerFeatureHubMock(testInstance, options.featureHubResponse);

                if (options.goodmock) {
                    registerGoodmockHooks(testInstance, options.goodmock, specName);
                }

                // Workspace settings + additional window properties — merge with parent
                // stack and inject beforeEach. Wraps the callback so nested describes inherit.
                insideRootDescribe = true;
                try {
                    withDescribeScope(title, details, () =>
                        withDescribeDetails(testInstance, settingsStack, awpStack, details, callback),
                    );
                } finally {
                    // Reset even if the body throws, so the next spec file starts outside again.
                    insideRootDescribe = false;
                }
            });
        };
        return describeFunction;
    };

    const makeTest = (
        name: string,
        register: (location: IPlaywrightLocation, ...args: unknown[]) => void,
    ) => {
        const testFunction = (...args: unknown[]) => {
            const location = getCallerLocation(testFunction);
            const [title, detailsOrBody, bodyArg] = args;

            // Only the `(title, ...)` forms register a test; the title-less forms
            // (`test.skip()`, `test.skip(condition)`, ...) are used inside tests and describes.
            if (typeof title !== "string") {
                register(location, ...args);
                return;
            }

            if (!insideRootDescribe) {
                throw new Error(`${name}("${title}") must be nested inside a test.describe() block.`);
            }

            const details =
                typeof detailsOrBody === "function"
                    ? undefined
                    : (detailsOrBody as ITestDetails<TestConditionsValue>);
            const body = typeof detailsOrBody === "function" ? detailsOrBody : bodyArg;

            assertValidConditions(details?.conditions, `${name}("${title}")`);
            const conditions = combineConditions(
                testConditions,
                conditionsStack[conditionsStack.length - 1],
                details?.conditions,
            );
            assertRequiredConditions(testConditions, conditions, `${name}("${title}")`, location.file);
            if (!shouldRunTest(testConditions, conditions, location.file, [...titleStack, title])) {
                // Conditions not met: register as skipped, whatever the variant (`only`, `fail`, ...).
                internals.modifier(
                    "skip",
                    location,
                    title,
                    details ? toPlaywrightDetails(details) : {},
                    body,
                );
                return;
            }

            if (!details) {
                register(location, title, body);
                return;
            }

            withTestDetails(testInstance, settingsStack, awpStack, location, title, details);
            register(location, title, toPlaywrightDetails(details), body);
        };
        return testFunction;
    };

    return Object.assign(
        makeTest("test", (location, ...args) => internals.createTest("default", location, ...args)),
        testInstance,
        {
            only: makeTest("test.only", (location, ...args) =>
                internals.createTest("only", location, ...args),
            ),
            skip: makeTest("test.skip", (location, ...args) => internals.modifier("skip", location, ...args)),
            fixme: makeTest("test.fixme", (location, ...args) =>
                internals.modifier("fixme", location, ...args),
            ),
            fail: Object.assign(
                makeTest("test.fail", (location, ...args) => internals.modifier("fail", location, ...args)),
                testInstance.fail,
                {
                    only: makeTest("test.fail.only", (location, ...args) =>
                        internals.createTest("fail.only", location, ...args),
                    ),
                },
            ),
            /** Build the overridden `test.describe` (with its variants) for a single `createTest` instance. */
            describe: Object.assign(makeDescribe("default", "test.describe"), testInstance.describe, {
                only: makeDescribe("only", "test.describe.only"),
                fixme: makeDescribe("fixme", "test.describe.fixme"),
                skip: makeDescribe("skip", "test.describe.skip"),
                serial: Object.assign(makeDescribe("serial", "test.describe.serial"), {
                    only: makeDescribe("serial.only", "test.describe.serial.only"),
                }),
                parallel: Object.assign(makeDescribe("parallel", "test.describe.parallel"), {
                    only: makeDescribe("parallel.only", "test.describe.parallel.only"),
                }),
            }),
        },
    );
}
