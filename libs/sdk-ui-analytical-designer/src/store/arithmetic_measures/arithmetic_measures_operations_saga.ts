// (C) 2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select, takeEvery } from "redux-saga/effects";

import { DEFAULT_DECIMAL_FORMAT } from "../../constants/formats.js";
import { createArithmeticMeasure } from "../../services/buckets_service.js";
import {
    buildRemoveBucketItemsDeps,
    catalogItemTypeResolver,
    readBucketsMeta,
    readIsVisualizationMdObjectValid,
    readPluggableVisualization,
    readReferencePointSyncValues,
} from "../buckets/buckets_operation_inputs.js";
import { getBucketsState } from "../buckets/buckets_selectors.js";
import { getFilterBarState } from "../filter_bar/filter_bar_selector.js";
import { getUiConfigSupportedOverTimeComparisonTypes } from "../reference_point/extended_reference_point_selectors.js";
import {
    getExtendedReferencePoint,
    getReferencePoint,
} from "../reference_point/reference_point_selectors.js";
import { type IAppState } from "../types.js";

import {
    storeAddArithmeticMeasure,
    storeSelectArithmeticMeasureOperand,
    storeSelectArithmeticMeasureOperator,
} from "./arithmetic_measures_actions.js";
import {
    arithmeticMeasureAdded,
    arithmeticMeasureOperandSelected,
    arithmeticMeasureOperatorSelected,
} from "./arithmetic_measures_operation_events.js";
import {
    type IArithmeticMeasureAddDeps,
    type IArithmeticMeasureAddInput,
    type IArithmeticMeasureOperandDeps,
    type IArithmeticMeasureOperandInput,
    type IArithmeticMeasureOperatorDeps,
    type IArithmeticMeasureOperatorInput,
    addArithmeticMeasureToBuckets,
    selectArithmeticMeasureOperandInBuckets,
    selectArithmeticMeasureOperatorInBuckets,
} from "./arithmetic_measures_operations.js";

/**
 * THE ARITHMETIC-MEASURE OPERATION SAGAS, in the same shape as `buckets_operations_saga.ts`: select
 * the typed input, select the deps, call the pure operation, put ONE semantic event. `takeEvery`,
 * because every dispatch applies; the trigger writes nothing.
 */

const readArithmeticMeasureAddInput = (state: IAppState): IArithmeticMeasureAddInput => ({
    buckets: getBucketsState(state),
    bucketsMeta: readBucketsMeta(state),
    filterBar: getFilterBarState(state),
    referencePoint: getReferencePoint(state),
});

const buildArithmeticMeasureAddDeps = (state: IAppState): IArithmeticMeasureAddDeps =>
    buildRemoveBucketItemsDeps(state);

const readArithmeticMeasureOperandInput = (state: IAppState): IArithmeticMeasureOperandInput => ({
    buckets: getBucketsState(state),
    bucketsMeta: readBucketsMeta(state),
    filterBar: getFilterBarState(state),
    bucketNotifications: state.data.bucketNotifications,
    extendedReferencePoint: getExtendedReferencePoint(state),
    pluggableVisualization: readPluggableVisualization(state),
    referencePoint: getReferencePoint(state),
    isVisualizationMdObjectValid: readIsVisualizationMdObjectValid(state),
});

const buildArithmeticMeasureOperandDeps = (state: IAppState): IArithmeticMeasureOperandDeps => ({
    ...buildRemoveBucketItemsDeps(state),
    supportedOverTimeComparisonTypes: getUiConfigSupportedOverTimeComparisonTypes(state, []),
});

const readArithmeticMeasureOperatorInput = (state: IAppState): IArithmeticMeasureOperatorInput => ({
    buckets: getBucketsState(state),
    referencePoint: getReferencePoint(state),
});

const buildArithmeticMeasureOperatorDeps = (state: IAppState): IArithmeticMeasureOperatorDeps => ({
    ...readReferencePointSyncValues(state),
    catalogItemType: catalogItemTypeResolver(state),
});

function* handleAddArithmeticMeasure({
    payload,
}: ReturnType<typeof storeAddArithmeticMeasure>): SagaIterator {
    const input: ReturnType<typeof readArithmeticMeasureAddInput> = yield select(
        readArithmeticMeasureAddInput,
    );
    const deps: ReturnType<typeof buildArithmeticMeasureAddDeps> = yield select(
        buildArithmeticMeasureAddDeps,
    );
    // the factory generates a fresh local identifier — the one impure step, kept at the boundary
    const newArithmeticMeasure: ReturnType<typeof createArithmeticMeasure> = yield call(
        createArithmeticMeasure,
        DEFAULT_DECIMAL_FORMAT,
    );

    const result: ReturnType<typeof addArithmeticMeasureToBuckets> = yield call(
        addArithmeticMeasureToBuckets,
        input,
        { bucketLocalIdentifier: payload.bucketLocalIdentifier, newArithmeticMeasure },
        deps,
    );

    // fewer than two measures commits nothing at all
    if (!result) {
        return;
    }

    yield put(arithmeticMeasureAdded(result));
}

function* handleSelectArithmeticMeasureOperand({
    payload,
}: ReturnType<typeof storeSelectArithmeticMeasureOperand>): SagaIterator {
    const input: ReturnType<typeof readArithmeticMeasureOperandInput> = yield select(
        readArithmeticMeasureOperandInput,
    );
    const deps: ReturnType<typeof buildArithmeticMeasureOperandDeps> = yield select(
        buildArithmeticMeasureOperandDeps,
    );

    const result: ReturnType<typeof selectArithmeticMeasureOperandInBuckets> = yield call(
        selectArithmeticMeasureOperandInBuckets,
        input,
        payload,
        deps,
    );

    yield put(arithmeticMeasureOperandSelected(result));
}

function* handleSelectArithmeticMeasureOperator({
    payload,
}: ReturnType<typeof storeSelectArithmeticMeasureOperator>): SagaIterator {
    const input: ReturnType<typeof readArithmeticMeasureOperatorInput> = yield select(
        readArithmeticMeasureOperatorInput,
    );
    const deps: ReturnType<typeof buildArithmeticMeasureOperatorDeps> = yield select(
        buildArithmeticMeasureOperatorDeps,
    );

    const result: ReturnType<typeof selectArithmeticMeasureOperatorInBuckets> = yield call(
        selectArithmeticMeasureOperatorInBuckets,
        input,
        payload,
        deps,
    );

    yield put(arithmeticMeasureOperatorSelected(result));
}

export function* watchArithmeticMeasureOperations(): SagaIterator {
    yield takeEvery(storeAddArithmeticMeasure.type, handleAddArithmeticMeasure);
    yield takeEvery(storeSelectArithmeticMeasureOperand.type, handleSelectArithmeticMeasureOperand);
    yield takeEvery(storeSelectArithmeticMeasureOperator.type, handleSelectArithmeticMeasureOperator);
}
