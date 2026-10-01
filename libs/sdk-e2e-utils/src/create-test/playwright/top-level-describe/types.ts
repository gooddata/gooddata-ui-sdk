// (C) 2026 GoodData Corporation

import type { Callback } from "../call-original-fn.js";
import type { ITestDetails } from "../types.js";

/**
 * @internal
 * Call signatures of the overridden `test.describe` and `test.describe.skip`.
 */
export interface ITopLevelDescribeFunction {
    (suiteName: string, specName: string, fn: Callback): void;
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
