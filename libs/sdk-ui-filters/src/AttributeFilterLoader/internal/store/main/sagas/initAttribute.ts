// (C) 2022 GoodData Corporation
import { v4 as uuidv4 } from "uuid";
import { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";

import { asyncRequestSaga } from "../../common/asyncRequestSaga";
import { actions } from "../../slice";

/**
 * @internal
 */
export function* initAttributeSaga(): SagaIterator<void> {
    const correlationId = `init_attribute_${uuidv4()}`;

    const initAttribute = () =>
        asyncRequestSaga(
            actions.attributeRequest({ correlationId }),
            actions.attributeSuccess.match,
            actions.attributeError.match,
            actions.attributeCancelRequest({ correlationId }),
        );

    yield call(initAttribute);
}
