// (C) 2019-2020 GoodData Corporation

/**
 * @internal
 */
export interface ICancelablePromise<T> {
    promise: Promise<T>;
    cancel: (reason?: string) => void;
}

/**
 * @internal
 */
export class CancelError extends Error {
    constructor(reason?: string) {
        super(reason || "Canceled");

        // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, CancelError.prototype);
    }
}

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
 * @param promise
 * @internal
 */
export function makeCancelable<T>(promise: Promise<T>): ICancelablePromise<T> {
    let cancelReason: string | undefined;
    let hasCanceled = false;

    const wrappedPromise = new Promise<T>((resolve, reject) => {
        promise.then(
            (value) => (hasCanceled ? reject(new CancelError(cancelReason)) : resolve(value)),
            (error) => (hasCanceled ? reject(new CancelError(cancelReason)) : reject(error)),
        );
    });

    return {
        promise: wrappedPromise,
        cancel: (reason?: string) => {
            hasCanceled = true;
            cancelReason = reason;
        },
    };
}
