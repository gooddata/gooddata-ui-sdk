// (C) 2019-2022 GoodData Corporation
import identity from "lodash/identity.js";
import { UseCancelablePromiseState, UseCancelablePromiseStatus } from "./useCancelablePromise.js";
import { UnexpectedSdkError } from "../errors/GoodDataSdkError.js";

/**
 * Resolve status of multiple {@link useCancelablePromise} hooks.
 *
 * @remarks
 * This is useful for useCancelablePromise composition - when you want to wrap multiple useCancelablePromise hooks in another hook,
 * and keep the return value shape of the hook same as for useCancelablePromise.
 *
 * You can choose between 2 strategies to resolve the status (default strategy is "serial"):
 * - serial: Short-circuits to the first pending/loading/error status, and returns the last status
 *   only when all previous statuses are "success".
 * - parallel: Is resolved to the status which has the highest priority.
 *   Priority of the statuses has the following order (from highest to lowest): pending, loading, error, success.
 *   Examples:
 *     - ["pending", "loading"] will be resolved to "pending"
 *     - ["loading", "error"] will be resolved to "loading"
 *     - ["error", "success"] will be resolved to "error"
 *     - ["success", "success"] will be resolved to "success"
 *
 * @param states - cancelable promise states (useCancelablePromise return values)
 * @param options - specify options for resolving the status
 * @returns resolved status
 * @public
 */
export function resolveUseCancelablePromisesStatus(
    cancelablePromisesStates: UseCancelablePromiseState<unknown, unknown>[],
    options: {
        strategy?: "serial" | "parallel";
    } = {},
): UseCancelablePromiseStatus {
    const statuses = collectUseCancelablePromiseStatuses(cancelablePromisesStates);
    const strategy = options.strategy ?? "serial";

    return strategy === "parallel"
        ? resolveUseCancelablePromisesStatusParallel(statuses)
        : resolveUseCancelablePromisesStatusSerial(statuses);
}

/**
 * Resolve error of multiple {@link useCancelablePromise} hooks - gets first error in the sequence of cancelable promise states.
 *
 * @remarks
 * This is useful for useCancelablePromise composition - when you want to wrap multiple useCancelablePromise hooks in another hook,
 * and keep the return value shape of the hook same as for useCancelablePromise.
 *
 * @param states - cancelable promise states (useCancelablePromise return values)
 * @returns first error
 * @public
 */
export function resolveUseCancelablePromisesError<TError>(
    states: UseCancelablePromiseState<unknown, TError>[],
): TError | undefined {
    const errors = collectUseCancelablePromiseErrors(states);
    return errors.find(identity);
}

/**
 * @internal
 */
export function resolveUseCancelablePromisesStatusSerial(
    statuses: UseCancelablePromiseStatus[],
): UseCancelablePromiseStatus {
    return statuses.reduce((prevStatus, nextStatus) => {
        switch (prevStatus) {
            case "pending":
            case "loading":
            case "error":
                return prevStatus;
            case "success":
                return nextStatus;
            default: {
                const a: never = prevStatus;
                throw new UnexpectedSdkError(`Unknown useCancelablePromise status: ${a}`);
            }
        }
    });
}

const priorityByStatus: { [status in UseCancelablePromiseStatus]: number } = {
    pending: 0,
    loading: 1,
    error: 2,
    success: 3,
};

function compareStatus(a: UseCancelablePromiseStatus, b: UseCancelablePromiseStatus): number {
    const aPriority = priorityByStatus[a];
    const bPriority = priorityByStatus[b];

    if (aPriority < bPriority) {
        return -1;
    }
    if (aPriority > bPriority) {
        return 1;
    }

    return 0;
}

/**
 * @internal
 */
export function resolveUseCancelablePromisesStatusParallel(
    statuses: UseCancelablePromiseStatus[],
): UseCancelablePromiseStatus {
    const [finalStatus] = [...statuses].sort(compareStatus);
    return finalStatus;
}

function collectUseCancelablePromiseStatuses(
    results: UseCancelablePromiseState<unknown, unknown>[],
): UseCancelablePromiseStatus[] {
    return results.map((r) => r.status);
}

function collectUseCancelablePromiseErrors<TError>(
    results: UseCancelablePromiseState<unknown, TError>[],
): Array<TError | undefined> {
    return results.map((r) => r.error);
}
