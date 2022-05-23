// (C) 2022 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { call, cancelled, getContext } from "redux-saga/effects";

import { AttributeFilterStoreContext } from "../types";

/**
 * @internal
 */
export type PromiseReturnType<T> = T extends Promise<infer U> ? U : any;

/**
 * @internal
 */
export type PromiseFnReturnType<T extends (...args: any) => any> = PromiseReturnType<ReturnType<T>>;

/**
 * @internal
 */
export function* getAttributeFilterContext(): SagaIterator<AttributeFilterStoreContext> {
    return yield getContext("attributeFilterContext");
}

/**
 * @internal
 */
export function* cancelableCall<T>({
    promise,
    onSuccess,
    onCancel,
    onError,
    controller = new AbortController(),
}: {
    promise: (signal: AbortSignal) => Promise<T>;
    onCancel?: (() => SagaIterator<void>) | (() => void);
    onSuccess?: ((result: T) => SagaIterator<void>) | ((result: T) => void) | ((result: T) => Promise<void>);
    onError?: ((error: any) => SagaIterator<void>) | ((error: any) => void) | ((error: any) => Promise<void>);
    controller?: AbortController;
}): SagaIterator<void> {
    try {
        const result: T = yield call(promise, controller.signal);
        if (onSuccess) {
            yield call(onSuccess, result);
        }
    } catch (e) {
        if (onError) {
            yield call(onError, e);
        }
    } finally {
        if (yield cancelled()) {
            controller.abort();
            if (onCancel) {
                yield call(onCancel);
            }
        }
    }
}
