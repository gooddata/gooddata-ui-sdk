// (C) 2026 GoodData Corporation

// oxlint-disable typescript/no-empty-object-type

import type { Fixtures as PlaywrightFixtures } from "@playwright/test";

import { type PlaywrightBaseTestArgs, type PlaywrightBaseWorkerArgs } from "./playwright-types.js";

/**
 * @internal
 */
export type Fixtures<T extends {} = {}, W extends {} = {}> = PlaywrightFixtures<
    T,
    W,
    PlaywrightBaseTestArgs,
    PlaywrightBaseWorkerArgs
>;
