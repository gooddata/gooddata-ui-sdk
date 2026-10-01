// (C) 2026 GoodData Corporation

import { registerFeatureHubMock } from "../../feature-hub/mock.js";
import { registerGoodmockHooks } from "../../goodmock/playwright.js";
import type { Callback } from "../call-original-fn.js";
import type { Test } from "../playwright-types.js";
import type { ICustomCreateTestOptions } from "../test/types.js";
import type { ITestDetails, WindowProperties, WorkspaceSettings } from "../types.js";
import { withDescribeDetails } from "../with-describe-details.js";

export interface ISetInsideTopLevelDescribe {
    (value: boolean): void;
}

export function buildSuiteCallback(
    testInstance: Test,
    options: ICustomCreateTestOptions,
    settingsStack: WorkspaceSettings[],
    awpStack: WindowProperties[],
    setInsideTopLevelDescribe: ISetInsideTopLevelDescribe,
    specName: string,
    details: ITestDetails | undefined,
    fn: Callback,
): Callback {
    return () => {
        registerFeatureHubMock(testInstance, options.featureHubResponse);

        if (options.goodmock?.host) {
            registerGoodmockHooks(testInstance, options.goodmock, specName);
        }

        // Workspace settings + additional window properties — merge with parent
        // stack and inject beforeEach. Wraps fn() so nested describes inherit.
        setInsideTopLevelDescribe(true);
        withDescribeDetails(testInstance, settingsStack, awpStack, details, fn);
        setInsideTopLevelDescribe(false);
    };
}
