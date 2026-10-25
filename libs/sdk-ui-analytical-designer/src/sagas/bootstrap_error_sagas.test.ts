// (C) 2007-2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import { call, select } from "redux-saga/effects";
import { describe, it } from "vitest";

import { bootstrapError as bootstrapErrorAction } from "../actions/app_context_actions.js";
import {
    getSSOExpiredUrl,
    getSSOUnauthorizedUrl,
    showSSOCustomUnauthorizedLoginPage,
} from "../selectors/bootstrap_selector.js";
import { getErrorHandler } from "../services/bootstrap_error_service.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { isLoggedInViaSso } from "../utils/sso.js";

import { bootstrapError } from "./bootstrap_error_sagas.js";

describe("bootstrapError", () => {
    const state = getInitializedState();
    const action = bootstrapErrorAction("foo", { type: "error" });
    const loggedViaSso = true;
    const handler = () => ({});
    it("should handle the error and call getErrorHandler with uiSettings is undefined if login is sso and handler is found", () => {
        return expectSaga(bootstrapError, action)
            .withState(state)
            .provide([
                [call(isLoggedInViaSso), !loggedViaSso],
                [call(getErrorHandler, state, action, !loggedViaSso), handler],
            ])
            .call(handler, action.payload)
            .silentRun();
    });

    it("should call getErrorHandler with uiSettings get from Api if error is not authenticated and is sso", () => {
        const mockAction = bootstrapErrorAction("foo", { type: "NOT_AUTHENTICATED_ERROR" });
        return expectSaga(bootstrapError, mockAction)
            .withState(state)
            .provide([
                [call(isLoggedInViaSso), loggedViaSso],
                [call(getErrorHandler, state, mockAction, loggedViaSso), handler],
            ])
            .call(isLoggedInViaSso)
            .call(getErrorHandler, state, mockAction, loggedViaSso)
            .call(handler, mockAction.payload)
            .silentRun();
    });

    it("should call getErrorHandler with uiSettings from State if error is not authenticated and is sso", () => {
        const mockAction = bootstrapErrorAction("foo", { type: "ACCESS_DESIGNER_DENIED_ERROR" });
        return expectSaga(bootstrapError, mockAction)
            .withState(state)
            .provide([
                [call(isLoggedInViaSso), loggedViaSso],
                [select(showSSOCustomUnauthorizedLoginPage), true],
                [select(getSSOExpiredUrl), "http://ssoExpiredUrl.com"],
                [select(getSSOUnauthorizedUrl), "http://ssoUnauthorizedUrl.com"],
                [call(getErrorHandler, state, mockAction, loggedViaSso), handler],
            ])
            .call(isLoggedInViaSso)
            .call(getErrorHandler, state, mockAction, loggedViaSso)
            .call(handler, mockAction.payload)
            .silentRun();
    });
});
