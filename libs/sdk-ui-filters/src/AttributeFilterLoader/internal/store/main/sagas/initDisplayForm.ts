// (C) 2022 GoodData Corporation
import { v4 as uuidv4 } from "uuid";
import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { selectAttributeFilterDisplayForm } from "../../attributeFilter/selectors";
import { actions } from "../../slice";

export function* initDisplayForm(): SagaIterator<void> {
    const correlationId = `init_displayForm_${uuidv4()}`;
    const displayFormRef: ReturnType<typeof selectAttributeFilterDisplayForm> = yield select(
        selectAttributeFilterDisplayForm,
    );

    yield put(actions.displayFormRequest({ displayFormRef, correlationId }));
}
