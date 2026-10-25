// (C) 2020-2026 GoodData Corporation

import { type UnknownAction } from "redux";
import { expectSaga } from "redux-saga-test-plan";
import { select } from "redux-saga/effects";

import { SUPPORTED_COMMANDS } from "../postMessageApi/outgoing/supported_commands_events.js";
import { availableCommandsSelector } from "../postMessageApi/state/selectors/post_message_context_selector.js";
import { rootReducer } from "../reducers/root_reducer.js";
import { root as rootSaga } from "../sagas/sagas.js";
import { type IAppState } from "../store/types.js";

export async function dispatchAction(state: IAppState, action: UnknownAction) {
    const { storeState } = await expectSaga(rootSaga)
        .withReducer(rootReducer, state)
        .provide([[select(availableCommandsSelector), SUPPORTED_COMMANDS]])
        .dispatch(action)
        .silentRun(0);
    return rootReducer(storeState, action);
}
