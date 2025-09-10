// (C) 2024-2025 GoodData Corporation

import { call, getContext, put } from "redux-saga/effects";

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { setSettingsAction } from "../chatWindow/chatWindowSlice.js";
import { OptionsDispatcher } from "../options.js";

/**
 * Load settings from the backend.
 * @internal
 */
export function* loadSettings() {
    const options: OptionsDispatcher = yield getContext("optionsDispatcher");

    try {
        const settings = options.getSettings();

        if (settings) {
            // If settings is already provided, just set it to the store
            yield put(
                setSettingsAction({
                    settings,
                }),
            );
            return;
        }

        // Retrieve backend from context
        const backend: IAnalyticalBackend = yield getContext("backend");
        const workspace: string = yield getContext("workspace");

        const settingsCall = backend.workspace(workspace).settings().getSettingsForCurrentUser;

        const results: Awaited<ReturnType<typeof settingsCall>> = yield call(settingsCall);

        options.setSettings(results);
        yield put(
            setSettingsAction({
                settings: results,
            }),
        );
    } catch {
        options.setSettings(undefined);
        yield put(
            setSettingsAction({
                settings: undefined,
            }),
        );
    }
}
