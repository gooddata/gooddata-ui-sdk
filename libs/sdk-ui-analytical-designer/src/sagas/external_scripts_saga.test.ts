// (C) 2007-2026 GoodData Corporation

import { expectSaga } from "redux-saga-test-plan";
import { call, select } from "redux-saga/effects";
import { describe, it } from "vitest";

import { trialSnippet, walkMe } from "@gooddata/js-utils";

import { loadExternalScripts } from "../actions/app_context_actions.js";
import { externalScripts } from "../selectors/bootstrap_selector.js";

import { watchLoadExternalScripts } from "./external_scripts_saga.js";

describe("External scripts", () => {
    it("should call walkme.load", () => {
        const walkMeHash = "fakeHash";
        const walkMeEnvironment = "fakeEnvironment";
        const includeTrialSnippet = "snippet";

        const saga = expectSaga(watchLoadExternalScripts);

        return saga
            .provide([
                [select(externalScripts), { walkMe: walkMeHash, walkMeEnvironment, includeTrialSnippet }],
                [call(walkMe.load, walkMeHash, walkMeEnvironment, true), undefined],
                [call(trialSnippet.load, includeTrialSnippet), undefined],
            ])
            .dispatch(
                loadExternalScripts({
                    walkMe: walkMeHash,
                    walkMeEnvironment,
                    includeTrialSnippet,
                }),
            )
            .run();
    });
});
