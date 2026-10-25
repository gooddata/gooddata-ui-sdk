// (C) 2020-2026 GoodData Corporation

import { type SagaReturnType, call, delay, put, select, takeEvery, takeLatest } from "redux-saga/effects";

import { ActionTypeKeys as Action, ActionTypeKeys } from "../../constants/actions.js";
import {
    resetRemovedItems,
    resetRemovedItemsWereJustUpdated,
} from "../../store/bucket_notifications/bucket_notifications_actions.js";
import {
    getRemovedItems,
    wereRemovedItemsJustUpdated,
} from "../../store/bucket_notifications/bucket_notifications_selector.js";

const NOTIFICATION_HIDING_DELAY = 30_000;

function* isRemovedItemsNotificationVisible() {
    const removedItems: ReturnType<typeof getRemovedItems> = yield select(getRemovedItems);
    return removedItems !== null;
}

function* hideBucketNotificationsWithDelay(delayInMilliseconds: number) {
    yield delay(delayInMilliseconds);

    const removedItemsNotificationVisible: SagaReturnType<typeof isRemovedItemsNotificationVisible> =
        yield call(isRemovedItemsNotificationVisible);
    if (removedItemsNotificationVisible) {
        yield put(resetRemovedItems());
    }
}

function* handleRemovedItemsNotifications() {
    const removedItemsNotificationVisible: SagaReturnType<typeof isRemovedItemsNotificationVisible> =
        yield call(isRemovedItemsNotificationVisible);
    if (removedItemsNotificationVisible) {
        const justUpdated: ReturnType<typeof wereRemovedItemsJustUpdated> =
            yield select(wereRemovedItemsJustUpdated);
        yield put(justUpdated ? resetRemovedItemsWereJustUpdated() : resetRemovedItems());
    }
}

function* resetBucketNotifications() {
    yield put(resetRemovedItems());
}

export function* watchBucketsToSetNotifications() {
    yield takeLatest(Action.EXTENDED_REFERENCE_POINT_CHANGED, () =>
        hideBucketNotificationsWithDelay(NOTIFICATION_HIDING_DELAY),
    );
    yield takeLatest(Action.EXTENDED_REFERENCE_POINT_CHANGED, handleRemovedItemsNotifications);
    yield takeEvery(ActionTypeKeys.UNDO_ACTION, resetBucketNotifications);
    yield takeEvery(ActionTypeKeys.REDO_ACTION, resetBucketNotifications);
}
