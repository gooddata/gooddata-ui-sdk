// (C) 2026 GoodData Corporation

import { type IExecutionResultLimitBreak } from "@gooddata/sdk-model";

import { type IErrorResponseData, type IMissingDateFilterItem } from "../../typings/report.js";

/**
 * `report.execution` — the lifecycle of the CURRENT report execution.
 *
 * `id` is the correlation key that makes a late-arriving result harmless: a result whose action
 * `meta.id` no longer matches this field belongs to a superseded execution and must not touch the
 * current state — it rewrites the matching undo/redo snapshots instead.
 *
 * `error` and `warning` are absent-until-written, deliberately optional rather than
 * null-initialized: every execution start DELETES them and the readers all test for PRESENCE
 * (`!!error && error.status === ...`), so an absent key and a null one are not interchangeable.
 */
export interface IExecutionState {
    id: string | null;
    running: boolean;
    hasData: boolean;
    error?: {
        status?: unknown;
        responseData?: IErrorResponseData | Record<string, never>;
        /** on a not-found open failure: the items the insight references but the workspace no longer has */
        missingItems?: ReadonlyArray<IMissingDateFilterItem>;
    };
    warning?: {
        limitBreaks?: ReadonlyArray<IExecutionResultLimitBreak>;
    };
}

export const executionInitialState: IExecutionState = {
    id: null,
    running: false,
    hasData: false,
};
