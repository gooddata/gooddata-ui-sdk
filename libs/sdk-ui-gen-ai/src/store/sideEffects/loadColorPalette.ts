// (C) 2024-2025 GoodData Corporation

import { call, getContext, put } from "redux-saga/effects";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { setColorPaletteAction } from "../chatWindow/chatWindowSlice.js";
import { type OptionsDispatcher } from "../options.js";

/**
 * Load color palette from the backend.
 * @internal
 */
export function* loadColorPalette() {
    const options: OptionsDispatcher = yield getContext("optionsDispatcher");

    try {
        const colorPalette = options.getColorPalette();

        if (colorPalette) {
            // If color palette is already provided, just set it to the store
            yield put(
                setColorPaletteAction({
                    colorPalette,
                }),
            );
            return;
        }

        // Retrieve backend from context
        const backend: IAnalyticalBackend = yield getContext("backend");
        const workspace: string = yield getContext("workspace");

        const stylingService = backend.workspace(workspace).styling();
        const colorPaletteCall = stylingService.getColorPalette.bind(stylingService);

        const results: Awaited<ReturnType<typeof colorPaletteCall>> = yield call(colorPaletteCall);

        options.setColorPalette(results);
        yield put(
            setColorPaletteAction({
                colorPalette: results,
            }),
        );
    } catch (e) {
        options.setColorPalette(undefined);
        console.error("Failed to load color palette", e);
        yield put(
            setColorPaletteAction({
                colorPalette: undefined,
            }),
        );
    }
}
