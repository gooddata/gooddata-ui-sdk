// (C) 2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { getContext } from "redux-saga/effects";

import { AttributeFilterHandlerStoreContext } from "../store/types.js";

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
export function* getAttributeFilterContext(): SagaIterator<AttributeFilterHandlerStoreContext> {
    return yield getContext("attributeFilterContext");
}
