// (C) 2026 GoodData Corporation

import {
    type Callback,
    type OriginalFn,
    callOriginalFn,
    parseArgs,
    toPlaywrightDetails,
} from "../call-original-fn.js";
import type {
    DescribeConfigure,
    DescribeFixme,
    DescribeOnly,
    DescribeParallel,
    DescribeSerial,
    Test,
} from "../playwright-types.js";
import type { ITestDetails, WindowProperties, WorkspaceSettings } from "../types.js";
import { withDescribeDetails } from "../with-describe-details.js";

export interface IGetInsideTopLevelDescribe {
    (): boolean;
}

/**
 * @internal
 * Call signatures of the overridden `test.describe` and `test.describe.skip`.
 */
export interface IDescribeFunction {
    (title: string, callback: Callback): void;
    (title: string, details: ITestDetails, callback: Callback): void;
}

/**
 * @internal
 */
export interface IDescribe extends IDescribeFunction {
    skip: IDescribeFunction;
    only: DescribeOnly;
    configure: DescribeConfigure;
    fixme: DescribeFixme;
    serial: DescribeSerial;
    parallel: DescribeParallel;
}

interface IParsedDescribeArgs {
    details: ITestDetails | undefined;
    callback: Callback;
}

/** Normalize the three describe overloads: `(title, cb)` and `(title, details, cb)`. */
function parseDescribeArgs(detailsOrCb: ITestDetails | Callback, cb?: Callback): IParsedDescribeArgs {
    const { details, fn } = parseArgs(detailsOrCb, cb);
    return { details, callback: fn };
}

export function makeDescribeFunction(
    originalFn: OriginalFn,
    testInstance: Test,
    settingsStack: WorkspaceSettings[],
    awpStack: WindowProperties[],
    getInsideTopLevelDescribe: IGetInsideTopLevelDescribe,
): IDescribeFunction {
    return (title: string, detailsOrCb: ITestDetails | Callback, cb?: Callback) => {
        const { details, callback } = parseDescribeArgs(detailsOrCb, cb);

        if (!getInsideTopLevelDescribe()) {
            const call = title === undefined ? "test.describe()" : `test.describe("${title}")`;
            throw new Error(`${call} must be nested inside a test.topLevelDescribe() block.`);
        }

        callOriginalFn(originalFn, title, toPlaywrightDetails(details), () =>
            withDescribeDetails(testInstance, settingsStack, awpStack, details, callback as Callback),
        );
    };
}
