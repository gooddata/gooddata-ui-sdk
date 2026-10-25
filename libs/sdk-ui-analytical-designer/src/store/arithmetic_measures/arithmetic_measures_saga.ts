// (C) 2019-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { put, takeEvery } from "redux-saga/effects";

import { resetHighlightedBucketItems } from "../highlighting/highlighting_actions.js";

import {
    addArithmeticMeasure,
    selectArithmeticMeasureOperand,
    selectArithmeticMeasureOperator,
    storeAddArithmeticMeasure,
    storeSelectArithmeticMeasureOperand,
    storeSelectArithmeticMeasureOperator,
} from "./arithmetic_measures_actions.js";

function* handleAddArithmeticMeasure(action: ReturnType<typeof addArithmeticMeasure>): SagaIterator {
    const { bucketLocalIdentifier } = action.payload;
    yield put(storeAddArithmeticMeasure(bucketLocalIdentifier));
}

function* handleSelectArithmeticMeasureOperand(
    action: ReturnType<typeof selectArithmeticMeasureOperand>,
): SagaIterator {
    const { measureLocalIdentifier, operandIndex, selectedOperandMeasureLocalIdentifier } = action.payload;
    yield put(
        storeSelectArithmeticMeasureOperand(
            measureLocalIdentifier,
            operandIndex,
            selectedOperandMeasureLocalIdentifier,
        ),
    );
    yield put(resetHighlightedBucketItems());
}

function* handleSelectArithmeticMeasureOperator(
    action: ReturnType<typeof selectArithmeticMeasureOperator>,
): SagaIterator {
    const { measureLocalIdentifier, operator } = action.payload;
    yield put(storeSelectArithmeticMeasureOperator(measureLocalIdentifier, operator));
}

export function* watchArithmeticMeasures(): SagaIterator {
    yield takeEvery(addArithmeticMeasure.match, handleAddArithmeticMeasure);
    yield takeEvery(selectArithmeticMeasureOperand.match, handleSelectArithmeticMeasureOperand);
    yield takeEvery(selectArithmeticMeasureOperator.match, handleSelectArithmeticMeasureOperator);
}
