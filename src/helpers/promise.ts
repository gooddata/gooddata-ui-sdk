import { ErrorStates } from '../constants/errorStates';

export function getCancellable(promise) {
    let cancelled = false;
    return {
        promise: promise.then((result) => {
            if (cancelled) {
                return Promise.reject(ErrorStates.PROMISE_CANCELLED);
            }
            return result;
        }, (error) => {
            if (cancelled) {
                return Promise.reject(ErrorStates.PROMISE_CANCELLED);
            } else {
                return Promise.reject(error);
            }
        }),
        cancel: () => cancelled = true
    };
}
