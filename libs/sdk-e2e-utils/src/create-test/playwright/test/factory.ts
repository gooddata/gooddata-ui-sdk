// (C) 2026 GoodData Corporation

// oxlint-disable typescript-eslint/no-empty-object-type

import { test } from "@playwright/test";

import { type OriginalFn } from "../call-original-fn.js";
import { type IDescribe, makeDescribeFunction } from "../describe/factory.js";
import { makeTopLevelDescribeFunction } from "../top-level-describe/factory.js";
import { type ITopLevelDescribe } from "../top-level-describe/types.js";
import type { WindowProperties, WorkspaceSettings } from "../types.js";

import type { ICreateTestOptions, ITest } from "./types.js";

/**
 * @internal
 * @param options -
 */
export function createTest<T extends {} = {}, W extends {} = {}>(options: ICreateTestOptions<T, W>): ITest {
    // Tracks whether we're inside a topLevelDescribe during synchronous registration.
    let insideTopLevelDescribe = false;

    function getInsideTopLevelDescribe() {
        return insideTopLevelDescribe;
    }

    function setInsideTopLevelDescribe(value: boolean) {
        insideTopLevelDescribe = value;
    }

    // Stacks track workspace settings / additionalWindowProperties hierarchy during
    // synchronous describe registration. Each level merges on top of the parent's.
    // The beforeEach at each level captures the fully-merged snapshot, so the
    // innermost beforeEach (which runs last) wins.
    const settingsStack: WorkspaceSettings[] = [];
    const awpStack: WindowProperties[] = [];

    const testInstance = options.fixtures ? test.extend<T, W>(options.fixtures) : test;

    const makeDescribeWrapper = (originalFn: OriginalFn) =>
        makeDescribeFunction(originalFn, testInstance, settingsStack, awpStack, getInsideTopLevelDescribe);

    const makeTopLevelDescribeWrapper = (originalFn: OriginalFn) =>
        makeTopLevelDescribeFunction(
            originalFn,
            testInstance,
            options,
            settingsStack,
            awpStack,
            setInsideTopLevelDescribe,
        );

    const describe: IDescribe = Object.assign(
        makeDescribeWrapper(testInstance.describe),
        testInstance.describe,
        {
            only: makeDescribeWrapper(testInstance.describe.only),
            fixme: makeDescribeWrapper(testInstance.describe.fixme),
            skip: makeDescribeWrapper(testInstance.describe.skip),
        },
    );

    const topLevelDescribe: ITopLevelDescribe = Object.assign(
        makeTopLevelDescribeWrapper(testInstance.describe),
        {
            skip: makeTopLevelDescribeWrapper(testInstance.describe.skip),
        },
    );

    return Object.assign(testInstance.bind(undefined), testInstance, {
        /** Build the overridden `test.describe` (with its `.skip`, `.only`, `.fixme`) for a single `createTest` instance. */
        describe,
        /** Build `test.topLevelDescribe` (with its `.skip`) for a single `createTest` instance. */
        topLevelDescribe,
    });
}
