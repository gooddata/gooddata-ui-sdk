// (C) 2007-2026 GoodData Corporation

import { call, takeEvery } from "redux-saga/effects";

import { trialSnippet, walkMe } from "@gooddata/js-utils";

import { type ILoadExternalScriptsAction } from "../actions/app_context_actions.js";
import { ActionTypeKeys } from "../constants/actions.js";

export function* loadExternalScripts({ payload: { scripts } }: ILoadExternalScriptsAction) {
    // advised by walkme to put to HEAD section, we already put into HEAD in pixelperfect, so unify
    const attachToHead = true;
    yield call(walkMe.load, scripts.walkMe, scripts.walkMeEnvironment, attachToHead);
    yield call(trialSnippet.load, scripts.includeTrialSnippet);
}

export function* watchLoadExternalScripts() {
    yield takeEvery(ActionTypeKeys.LOAD_EXTERNAL_SCRIPTS_REQUESTED, loadExternalScripts);
}
