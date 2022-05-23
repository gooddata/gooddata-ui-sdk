// (C) 2022 GoodData Corporation
import { v4 as uuidv4 } from "uuid";
import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";
import { UnexpectedError } from "@gooddata/sdk-backend-spi";

import { selectDisplayFormAttributeRef } from "../../displayForm/selectors";
import { actions } from "../../slice";

export function* initAttribute(): SagaIterator<void> {
    const correlationId = `init_attribute_${uuidv4()}`;
    const attributeRef: ReturnType<typeof selectDisplayFormAttributeRef> = yield select(
        selectDisplayFormAttributeRef,
    );

    if (!attributeRef) {
        throw new UnexpectedError("Trying to load attribute before display form is loaded.");
    }

    yield put(actions.attributeRequest({ attributeRef, correlationId }));
}
