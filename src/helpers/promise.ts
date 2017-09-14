import { ErrorStates } from '../constants/errorStates';

export interface ICancellablePromise {
    promise: Promise<any>;
    cancel: () => void;
}

export function getCancellable(promise: Promise<any>): ICancellablePromise {
    let cancelled = false;
    return {
        promise: promise
            .then((result: any) => {
                if (cancelled) {
                    return Promise.reject(ErrorStates.PROMISE_CANCELLED);
                }
                return result;
            }, (error: Object) => {
                if (cancelled) {
                    return Promise.reject(ErrorStates.PROMISE_CANCELLED);
                } else {
                    return Promise.reject(error);
                }
            }),
        cancel: () => cancelled = true
    };
}
