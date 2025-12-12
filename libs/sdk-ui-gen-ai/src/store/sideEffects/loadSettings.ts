// (C) 2024-2025 GoodData Corporation

import { call, getContext, put } from "redux-saga/effects";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { setSettingsAction } from "../chatWindow/chatWindowSlice.js";
import { type OptionsDispatcher } from "../options.js";

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

        const settingsService = backend.workspace(workspace).settings();
        const settingsCall = settingsService.getSettingsForCurrentUser.bind(settingsService);

        const results: Awaited<ReturnType<typeof settingsCall>> = yield call(settingsCall);

        options.setSettings(results);
        yield put(
            setSettingsAction({
                settings: results,
            }),
        );
    } catch (e) {
        options.setSettings(undefined);
        console.error("Failed to load settings", e);
        yield put(
            setSettingsAction({
                settings: undefined,
            }),
        );
    }
}
