// (C) 2022 GoodData Corporation
import { v4 as uuidv4 } from "uuid";
import { SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";

import { actions } from "../../slice";

/**
 * @internal
 */
export function* initAttributeSaga(): SagaIterator<void> {
    const correlationId = `init_attribute_${uuidv4()}`;
    yield put(actions.attributeRequest({ correlationId }));
}
