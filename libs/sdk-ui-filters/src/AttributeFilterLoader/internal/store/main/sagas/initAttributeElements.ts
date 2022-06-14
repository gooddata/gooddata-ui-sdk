// (C) 2022 GoodData Corporation
import { v4 as uuidv4 } from "uuid";
import { SagaIterator } from "redux-saga";
import { put, call, SagaReturnType } from "redux-saga/effects";

import { asyncRequestSaga } from "../../common/asyncRequestSaga";
import { actions } from "../../slice";

/**
 * @internal
 */
export function* initAttributeElementsSaga(): SagaIterator<void> {
    const correlationId = `init_paging_${uuidv4()}`;

    const loadElements = () =>
        asyncRequestSaga(
            actions.attributeElementsRequest({ correlationId, offset: 0, limit: 550 }),
            actions.attributeElementsSuccess.match,
            actions.attributeElementsError.match,
            actions.attributeElementsCancelRequest({ correlationId }),
        );

    const { success }: SagaReturnType<typeof loadElements> = yield call(loadElements);

    if (success) {
        yield put(
            actions.setAttributeElements({
                attributeElements: success.payload.attributeElements,
            }),
        );

        yield put(
            actions.setAttributeElementsTotalCount({
                totalCount: success.payload.totalCount,
            }),
        );

        yield put(
            actions.setAttributeElementsTotalCountWithCurrentSettings({
                totalCount: success.payload.totalCount,
            }),
        );
    }
}
