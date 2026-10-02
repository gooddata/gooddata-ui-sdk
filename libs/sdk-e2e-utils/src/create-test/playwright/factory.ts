// (C) 2026 GoodData Corporation

// oxlint-disable typescript-eslint/no-empty-object-type

import { test } from "@playwright/test";

import { registerFeatureHubMock } from "../feature-hub/mock.js";
import { registerGoodmockHooks } from "../goodmock/playwright.js";

import {
    type IPlaywrightLocation,
    type PlaywrightDescribeType,
    getCallerLocation,
    getPlaywrightInternals,
} from "./playwright-internals.js";
import { toPlaywrightDetails } from "./to-playwright-details.js";
import type {
    Callback,
    ICreateTestOptions,
    ITestDetails,
    Test,
    WindowProperties,
    WorkspaceSettings,
} from "./types.js";
import { withDescribeDetails } from "./with-describe-details.js";

/**
 * @internal
 * @param options -
 */
export function createTest<T extends {} = {}, W extends {} = {}>(options: ICreateTestOptions<T, W>): Test {
    // Tracks whether we're inside a topLevelDescribe during synchronous registration.
    let insideTopLevelDescribe = false;

    // Stacks track workspace settings / additionalWindowProperties hierarchy during
    // synchronous describe registration. Each level merges on top of the parent's.
    // The beforeEach at each level captures the fully-merged snapshot, so the
    // innermost beforeEach (which runs last) wins.
    const settingsStack: WorkspaceSettings[] = [];
    const awpStack: WindowProperties[] = [];

    const testInstance = options.fixtures ? test.extend<T, W>(options.fixtures) : test;
    const internals = getPlaywrightInternals(testInstance);

    const makeDescribe = (type: PlaywrightDescribeType, name: string) => {
        return (title: string, details: ITestDetails, callback: Callback) => {
            if (!insideTopLevelDescribe) {
                throw new Error(`${name}("${title}") must be nested inside a test.topLevelDescribe() block.`);
            }

            internals.describe(type, getCallerLocation(), title, toPlaywrightDetails(details), () =>
                withDescribeDetails(testInstance, settingsStack, awpStack, details, callback),
            );
        };
    };

    // Spec files that already have a topLevelDescribe. Playwright loads each file once per process,
    // so a second registration from the same file means a second topLevelDescribe in that file.
    const filesWithTopLevelDescribe = new Set<string>();

    const makeTopLevelDescribe = (type: PlaywrightDescribeType) => {
        return (suiteName: string, specName: string, details: ITestDetails, fn: Callback) => {
            const location = getCallerLocation();

            if (filesWithTopLevelDescribe.has(location.file)) {
                throw new Error(
                    `test.topLevelDescribe("${suiteName}"): only one test.topLevelDescribe() is allowed per file (${location.file}).`,
                );
            }
            filesWithTopLevelDescribe.add(location.file);

            const suite = () => {
                registerFeatureHubMock(testInstance, options.featureHubResponse);

                if (options.goodmock) {
                    registerGoodmockHooks(testInstance, options.goodmock, specName);
                }

                // Workspace settings + additional window properties — merge with parent
                // stack and inject beforeEach. Wraps fn() so nested describes inherit.
                insideTopLevelDescribe = true;
                withDescribeDetails(testInstance, settingsStack, awpStack, details, fn);
                insideTopLevelDescribe = false;
            };

            const pwDetails = toPlaywrightDetails(details);

            internals.describe(type, location, suiteName, pwDetails, suite);
        };
    };

    const makeTest = (
        name: string,
        register: (location: IPlaywrightLocation, ...args: unknown[]) => void,
    ) => {
        return (...args: unknown[]) => {
            // Only the `(title, ...)` forms register a test; the title-less forms
            // (`test.skip()`, `test.skip(condition)`, ...) are used inside tests and describes.
            if (typeof args[0] === "string" && !insideTopLevelDescribe) {
                throw new Error(
                    `${name}("${args[0]}") must be nested inside a test.topLevelDescribe() block.`,
                );
            }

            register(getCallerLocation(), ...args);
        };
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
            /** Build the overridden `test.describe` (with its `.skip`, `.only`, `.fixme`) for a single `createTest` instance. */
            describe: Object.assign(makeDescribe("default", "describe"), testInstance.describe, {
                only: makeDescribe("only", "describe.only"),
                fixme: makeDescribe("fixme", "describe.fixme"),
                skip: makeDescribe("skip", "describe.skip"),
            }),
            /** Build `test.topLevelDescribe` (with its `.skip`) for a single `createTest` instance. */
            topLevelDescribe: Object.assign(makeTopLevelDescribe("default"), {
                skip: makeTopLevelDescribe("skip"),
            }),
        },
    );
}
