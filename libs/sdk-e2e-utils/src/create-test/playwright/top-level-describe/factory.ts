// (C) 2026 GoodData Corporation

// oxlint-disable typescript/no-empty-object-type

import {
    type Callback,
    type OriginalFn,
    callOriginalFn,
    parseArgs,
    toPlaywrightDetails,
} from "../call-original-fn.js";
import type { Test } from "../playwright-types.js";
import type { ICreateTestOptions } from "../test/types.js";
import type { ITestDetails, WorkspaceSettings } from "../types.js";

import { type ISetInsideTopLevelDescribe, buildSuiteCallback } from "./build-suite-callback.js";
import type { ITopLevelDescribeFunction } from "./types.js";

export function makeTopLevelDescribeFunction<T extends {} = {}, W extends {} = {}>(
    originalFn: OriginalFn,
    testInstance: Test,
    options: ICreateTestOptions<T, W>,
    settingsStack: WorkspaceSettings[],
    awpStack: WorkspaceSettings[],
    setInsideTopLevelDescribe: ISetInsideTopLevelDescribe,
): ITopLevelDescribeFunction {
    return (suiteName: string, specName: string, detailsOrFn: ITestDetails | Callback, func?: Callback) => {
        const { details, fn } = parseArgs(detailsOrFn, func);
        const suite = buildSuiteCallback(
            testInstance,
            options,
            settingsStack,
            awpStack,
            setInsideTopLevelDescribe,
            specName,
            details,
            fn,
        );
        const pwDetails = toPlaywrightDetails(details);

        callOriginalFn(originalFn, suiteName, pwDetails, suite);
    };
}
