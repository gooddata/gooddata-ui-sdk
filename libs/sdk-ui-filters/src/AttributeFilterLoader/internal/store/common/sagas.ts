// (C) 2022 GoodData Corporation
import { AnyAction } from "@reduxjs/toolkit";
import { SagaIterator } from "redux-saga";
import { call, race, take, cancelled, getContext } from "redux-saga/effects";

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
export type ICancelableEffectResult<TResult> =
    | {
          success: undefined;
          error: undefined;
          canceled: true;
      }
    | {
          success: TResult;
          error: undefined;
          canceled: false;
      }
    | {
          success: undefined;
          error: any;
          canceled: false;
      };

/**
 * @internal
 */
export function cancelableEffect<TResult, TCancelAction extends AnyAction>({
    effect,
    isCancelRequest,
}: {
    effect: () => Promise<TResult>;
    isCancelRequest: (action: AnyAction) => action is TCancelAction;
}): () => SagaIterator<ICancelableEffectResult<TResult>> {
    return function* () {
        try {
            const {
                success,
                canceled,
            }: {
                success: TResult;
                canceled: TCancelAction;
            } = yield race({
                success: call(effect),
                canceled: take(isCancelRequest),
            });

            if (success) {
                return {
                    success,
                    error: undefined,
                    canceled: false as const,
                };
            } else if (canceled) {
                return {
                    success: undefined,
                    error: undefined,
                    canceled: true as const,
                };
            }
        } catch (error) {
            return {
                success: undefined,
                error,
                canceled: false as const,
            };
        } finally {
            if (yield cancelled()) {
                // eslint-disable-next-line no-unsafe-finally
                return {
                    canceled: true as const,
                    success: undefined,
                    error: undefined,
                };
            }
        }
    };
}
