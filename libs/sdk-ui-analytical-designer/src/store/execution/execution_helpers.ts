// (C) 2026 GoodData Corporation

import { isEqual } from "lodash-es";

import { type IExecutionResultLimitBreak } from "@gooddata/sdk-model";

import { type IMissingDateFilterItem } from "../../typings/report.js";

import { type IExecutionState, executionInitialState } from "./execution_state.js";

/**
 * The domain's state transitions, written as IN-PLACE mutations of the execution object. They stay
 * standalone functions because that is what keeps the slice's case bodies readable.
 *
 * Mutation rather than `{...state, ...}` is deliberate: an immer draft must not be spread into a
 * returned object (nested values would be copied as draft proxies), and `delete` makes the key
 * ABSENT, which is what the `!!error` readers test for.
 */

export function startExecution(target: IExecutionState, id: string): void {
    target.id = id;
    target.running = true;
    target.hasData = false;
    // the previous run's result must not survive into the new one
    delete target.error;
    delete target.warning;
}

export function applyExecutionError(target: IExecutionState, error: IExecutionState["error"]): void {
    //
    // IDEMPOTENCE IS LOAD-BEARING, not an optimization. The pluggable visualization reports its
    // validation failures from render (PluggableVisualization#onError -> reportExecutionFailed), so
    // a write that changes state on every dispatch closes a render -> dispatch -> render loop that
    // pins the main thread: pie/table with an unsupported bucket set errors, we store a new object,
    // subscribers re-render, the chart errors again. The guard below is what breaks the loop:
    // replace the branch only when it actually DIFFERS, and replace it WHOLESALE rather than mutating
    // leaves, because `target` may be a shallow copy whose `error` is shared with another state.
    const status = error?.status;
    const responseData = error?.responseData || {};
    const current = target.error;

    if (!current || current.status !== status || !isEqual(current.responseData, responseData)) {
        target.error = { status, responseData };
    }
    delete target.warning;
    target.running = false;
}

export function finishExecution(target: IExecutionState): void {
    // The `report.nowOpen` write that goes with this is foreign to this domain — the coordination
    // event owns it. A warning already reported by the same execution is deliberately kept.
    target.running = false;
    target.hasData = true;
}

export function applyExecutionWarning(
    target: IExecutionState,
    limitBreaks: ReadonlyArray<IExecutionResultLimitBreak>,
): void {
    // idempotent for the same reason applyExecutionError is: the limit-break warning is also
    // re-reported from the render path, and an unguarded write would
    // a no-op for an equal value.
    if (!target.warning || !isEqual(target.warning.limitBreaks, limitBreaks)) {
        target.warning = { limitBreaks };
    }
}

/**
 * OPEN_REPORT_STARTED: the previous report's result must not be shown while the next one loads.
 */
export function clearExecutionResult(target: IExecutionState): void {
    delete target.error;
    delete target.warning;
}

/**
 * OPEN_REPORT_FAILED with no reason — the insight is gone. The result is the domain's initial state
 * plus the error, independent of what was running, because the application reset clears this subtree
 * first and the status lands on top.
 */
export function reportNotFoundError(
    status: unknown,
    missingItems?: ReadonlyArray<IMissingDateFilterItem>,
): IExecutionState {
    return {
        ...executionInitialState,
        error: { status, ...(missingItems?.length ? { missingItems } : {}) },
    };
}
