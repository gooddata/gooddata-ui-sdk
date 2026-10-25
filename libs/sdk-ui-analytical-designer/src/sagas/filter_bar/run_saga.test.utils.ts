// (C) 2020-2026 GoodData Corporation

import { type Action } from "redux";
import { type SagaIterator } from "redux-saga";
import { expectSaga } from "redux-saga-test-plan";
import { all, call } from "redux-saga/effects";

import { rootReducer } from "../../reducers/root_reducer.js";
import { type IAppState } from "../../store/types.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";

export async function runSaga(
    sagas: (() => SagaIterator)[],
    action: Action,
    state: IAppState = getInitializedState(),
): Promise<IAppState> {
    const saga = function* () {
        yield all(sagas.map((saga) => call(saga)));
    };

    const { storeState } = await expectSaga(saga)
        .withReducer(rootReducer, state)
        .dispatch(action)
        .silentRun(0);

    return storeState;
}
