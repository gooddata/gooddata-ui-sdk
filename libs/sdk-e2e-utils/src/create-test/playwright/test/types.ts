// (C) 2026 GoodData Corporation

// oxlint-disable typescript/no-empty-object-type

import type { IFeatureHubEnvironment } from "../../feature-hub/types.js";
import type { IGoodmockOptions } from "../../goodmock/types.js";
import type { IDescribe } from "../describe/factory.js";
import type { Fixtures } from "../fixtures.js";
import type { Test } from "../playwright-types.js";
import type { ITopLevelDescribe } from "../top-level-describe/types.js";

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
export type ITest = Test & {
    topLevelDescribe: ITopLevelDescribe;
    describe: IDescribe;
};
