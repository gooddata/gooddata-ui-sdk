// (C) 2019-2021 GoodData Corporation
import isError from "lodash/isError.js";

/**
 * @internal
 */
export interface ICancelablePromise<T> {
    promise: Promise<T>;
    cancel: (reason?: string) => void;
    getHasFulfilled: () => boolean;
    getHasCanceled: () => boolean;
}

/**
 * @internal
 */
const CANCEL_ERROR_MESSAGE = "Canceled";

/**
 * @internal
 */
export class CancelError extends Error {
    constructor(public reason?: string) {
        super(CANCEL_ERROR_MESSAGE);

        // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, CancelError.prototype);
    }

    /**
     * Underlying cause of this error (if any).
     */
    public getReason(): string | undefined {
        return this.reason;
    }
}

/**
 * @internal
 */
export const isCancelError = (obj: unknown): obj is CancelError => {
    return isError(obj) && obj.message === CANCEL_ERROR_MESSAGE;
};

/**
 * !!! USE WITH CAUTION !!! Opinionated utility to wrap promise and make it cancelable
 *
 * - It does not stop original promise execution after canceling, it just does not care about it's results anymore
 * (for example when react component unmounts)
 * - This is not meant to be universal solution to make promises cancelable, it's not easily composable,
 * and it's not good to solve more complex async logic
 * - For cancelable async operations, there are much better abstractions than promises, for example Tasks,
 * however there is no standard for this in JavaScript
 *
 * @internal
 */
export function makeCancelable<T>(promise: Promise<T>): ICancelablePromise<T> {
    let cancelReason: string | undefined;
    let hasCanceled = false;
    let hasFulfilled = false;

    const wrappedPromise = new Promise<T>((resolve, reject) => {
        promise.then(
            (value) => {
                if (hasCanceled) {
                    reject(new CancelError(cancelReason));
                } else {
                    hasFulfilled = true;
                    resolve(value);
                }
            },
            (error) => {
                if (hasCanceled) {
                    reject(new CancelError(cancelReason));
                } else {
                    hasFulfilled = true;
                    reject(error);
                }
            },
        );
    });

    return {
        promise: wrappedPromise,
        cancel: (reason?: string) => {
            hasCanceled = true;
            cancelReason = reason;
        },
        getHasCanceled: () => hasCanceled,
        getHasFulfilled: () => hasFulfilled,
    };
}
