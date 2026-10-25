// (C) 2021-2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import { call, select } from "redux-saga/effects";
import { describe, it, vi } from "vitest";

import { NotAuthenticated, UnexpectedError } from "@gooddata/sdk-backend-spi";

import { dataSourceError } from "../actions/messages_actions.js";
import { initialState } from "../reducers/initial_state.js";
import { getSSOExpiredUrl, showSSOCustomUnauthorizedLoginPage } from "../selectors/bootstrap_selector.js";
import { getAccountPageUri } from "../services/bootstrap_error_service.js";
import { isLoggedInViaSso } from "../utils/sso.js";

import { infoUriFailed, messagesDataSourceError, ssoTokenExpired } from "./application_redirect_sagas.js";
import { redirectToReport } from "./export_report_sagas.js";

vi.hoisted(() => {
    vi.resetModules();
});

// Hack that will get `jest.spyOn` work on ESM module (that is immutable) in CommonJS jest environment
// if they are imported as `import * as some_dependency from "some_dependency"` pattern.
// When Jest will be ESM native in the future, we will have to redesign the test (or possibly it will work
// as swc will not be necessary. See https://github.com/swc-project/swc/issues/3843
vi.mock("../backend", async (importOriginal) => {
    const actualModule = (await importOriginal()) as object;
    return {
        __esModule: true,
        ...actualModule,
    };
});

describe("Application Redirect Sagas", () => {
    const expectedRedirectUrl = "http://abc.com";
    const notAuthenticatedError = new NotAuthenticated("UnAuthorized");
    const unexpectedError = new UnexpectedError("unknown");

    it("should redirect to custom ssoUnAuthorized page when Error is 401, showSSOCustomUnauthorizedLoginPage is on, user is sso, backend is not Tiger", () => {
        return expectSaga(ssoTokenExpired, notAuthenticatedError)
            .withState(initialState)
            .provide([
                [call(isLoggedInViaSso), true],
                [select(showSSOCustomUnauthorizedLoginPage), true],
                [select(getSSOExpiredUrl), "http://abc.com"],
                // stubbed out: the real saga navigates the test window, and the mutated location
                // then leaks into every test file that runs later (the suite is non-isolated)
                [call(redirectToReport, window, expectedRedirectUrl), undefined],
            ])
            .call(isLoggedInViaSso)
            .call(redirectToReport, window, expectedRedirectUrl)
            .silentRun();
    });

    it("should redirect to info page when Error is 401, showSSOCustomUnauthorizedLoginPage is on, user is sso, backend is not Tiger, but there is no ssoExpireUrl config", () => {
        return expectSaga(ssoTokenExpired, notAuthenticatedError)
            .withState(initialState)
            .provide([
                [call(isLoggedInViaSso), true],
                [select(showSSOCustomUnauthorizedLoginPage), true],
                [select(getSSOExpiredUrl), undefined],
                [call(redirectToReport, window, infoUriFailed), undefined],
            ])
            .call(isLoggedInViaSso)
            .call(redirectToReport, window, infoUriFailed)
            .silentRun();
    });

    it("should redirect to login GD page when Error is 401, user is sso, backend is not Tiger, but showSSOCustomUnauthorizedLoginPage is off", () => {
        const expectedRedirectUrl = "/account.html";
        return expectSaga(ssoTokenExpired, notAuthenticatedError)
            .withState(initialState)
            .provide([
                [call(isLoggedInViaSso), true],
                [select(showSSOCustomUnauthorizedLoginPage), false],
                [call(getAccountPageUri, { location }), expectedRedirectUrl],
                [call(redirectToReport, window, expectedRedirectUrl), undefined],
            ])
            .call(isLoggedInViaSso)
            .call(redirectToReport, window, expectedRedirectUrl)
            .silentRun();
    });

    it("should not redirect when Error is not 401", () => {
        return expectSaga(ssoTokenExpired, unexpectedError)
            .withState(initialState)
            .provide([
                [call(isLoggedInViaSso), true],
                [select(showSSOCustomUnauthorizedLoginPage), true],
                [select(getSSOExpiredUrl), "http://abc.com"],
            ])
            .call(isLoggedInViaSso)
            .not.call(redirectToReport, window, expectedRedirectUrl)
            .returns(undefined)
            .silentRun();
    });

    it("should not redirect when Error is 401, showSSOCustomUnauthorizedLoginPage is on, backend is not Tiger, but is not SSO", () => {
        return expectSaga(ssoTokenExpired, notAuthenticatedError)
            .withState(initialState)
            .provide([
                [call(isLoggedInViaSso), false],
                [select(showSSOCustomUnauthorizedLoginPage), true],
            ])
            .call(isLoggedInViaSso)
            .not.call(redirectToReport, window, expectedRedirectUrl)
            .returns(undefined)
            .silentRun();
    });

    it("should not redirect when backend is Tiger", () => {
        return expectSaga(ssoTokenExpired, notAuthenticatedError)
            .withState(initialState)
            .provide([])
            .not.call(redirectToReport, window, expectedRedirectUrl)
            .returns(undefined)
            .silentRun();
    });

    it("should not redirect when error is undefined", () => {
        return expectSaga(ssoTokenExpired, undefined)
            .withState(initialState)
            .provide([])
            .not.call(redirectToReport, window, expectedRedirectUrl)
            .returns(undefined)
            .silentRun();
    });

    describe("messagesDataSourceError watcher", () => {
        // Regression guard: the reducer-level filter that suppresses the toast for
        // semantic 4xx errors MUST NOT break the dispatch-driven SSO 401 redirect path.
        // The catalog sagas continue to dispatch MESSAGES_DATA_SOURCE_ERROR for every
        // caught error; the watcher must keep forwarding the error to ssoTokenExpired.
        it("forwards the dispatched error to ssoTokenExpired", () => {
            const action = dataSourceError(notAuthenticatedError);

            return expectSaga(messagesDataSourceError, action)
                .withState(initialState)
                .provide([[call(ssoTokenExpired, notAuthenticatedError), undefined]])
                .call(ssoTokenExpired, notAuthenticatedError)
                .silentRun();
        });
    });
});
