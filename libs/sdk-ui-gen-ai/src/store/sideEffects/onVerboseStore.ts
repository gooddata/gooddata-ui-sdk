// (C) 2024-2025 GoodData Corporation

import { select } from "redux-saga/effects";

import { isVerboseSelector } from "../messages/messagesSelectors.js";
import { LS_VERBOSE_KEY } from "../messages/messagesSlice.js";

/**
 * Ensure the verbosity state is saved in the localstorage of the browser.
 * @internal
 */
export function* onVerboseStore() {
    const newVerbose: boolean = yield select(isVerboseSelector);

    if (newVerbose) {
        window.localStorage.setItem(LS_VERBOSE_KEY, "true");
    } else {
        window.localStorage.removeItem(LS_VERBOSE_KEY);
    }
}
