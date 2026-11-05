// (C) 2007-2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import { call } from "redux-saga/effects";
import { describe, it } from "vitest";

import { bootstrapError as bootstrapErrorAction } from "../actions/app_context_actions.js";
import { getErrorHandler } from "../services/bootstrap_error_service.js";
import { getInitializedState } from "../tests/state.test.helpers.js";

import { bootstrapError } from "./bootstrap_error_sagas.js";

describe("bootstrapError", () => {
    const state = getInitializedState();
    const handler = () => ({});

    it("should call the error handler returned by getErrorHandler", () => {
        const action = bootstrapErrorAction("foo", { type: "ACCESS_DESIGNER_DENIED_ERROR" });
        return expectSaga(bootstrapError, action)
            .withState(state)
            .provide([[call(getErrorHandler, state, action), handler]])
            .call(getErrorHandler, state, action)
            .call(handler, action.payload)
            .silentRun();
    });

    it("should not fail when no error handler is found", () => {
        const action = bootstrapErrorAction("foo", { type: "error" });
        return expectSaga(bootstrapError, action)
            .withState(state)
            .provide([[call(getErrorHandler, state, action), undefined]])
            .call(getErrorHandler, state, action)
            .not.call(handler, action.payload)
            .silentRun();
    });
});
