// (C) 2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put, take, race, cancelled } from "redux-saga/effects";
import { AnyAction } from "@reduxjs/toolkit";

/**
 * @internal
 */
interface AnyActionWithCorrelation extends AnyAction {
    payload: {
        correlationId: string;
    };
}

/**
 * @internal
 */
function isActionWithCorrelationId(action: unknown): action is AnyActionWithCorrelation {
    return !!(action as any)?.payload?.correlationId;
}

function isActionsCorrelationIdEqual(actionA: AnyAction, actionB: AnyAction) {
    return (
        isActionWithCorrelationId(actionA) &&
        isActionWithCorrelationId(actionB) &&
        actionA.payload.correlationId === actionB.payload.correlationId
    );
}

/**
 * @internal
 */
type AsyncRequestSagaResult<TSuccess extends AnyAction, TError extends AnyAction> =
    | {
          success: TSuccess;
          error: undefined;
      }
    | {
          success: undefined;
          error: TError;
      };

/**
 * @internal
 */
export function* asyncRequestSaga<TSuccess extends AnyAction, TError extends AnyAction>(
    trigger: AnyAction,
    isSuccess: (action: unknown) => action is TSuccess,
    isError: (action: unknown) => action is TError,
    cancelRequest: AnyAction,
): SagaIterator<AsyncRequestSagaResult<TSuccess, TError>> {
    yield put(trigger);
    const hasCorrelationId = isActionWithCorrelationId(trigger);

    try {
        const raceResult: AsyncRequestSagaResult<TSuccess, TError> = yield race({
            success: take(
                (a: AnyAction) =>
                    isSuccess(a) && (hasCorrelationId ? isActionsCorrelationIdEqual(a, trigger) : true),
            ),
            error: take(
                (a: AnyAction) =>
                    isError(a) && (hasCorrelationId ? isActionsCorrelationIdEqual(a, trigger) : true),
            ),
        });

        return raceResult;
    } finally {
        if (yield cancelled()) {
            yield put(cancelRequest);
        }
    }
}
