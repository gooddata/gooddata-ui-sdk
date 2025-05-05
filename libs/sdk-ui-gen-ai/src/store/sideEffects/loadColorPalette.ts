// (C) 2024-2025 GoodData Corporation

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { call, getContext, put } from "redux-saga/effects";
import { IColorPalette } from "@gooddata/sdk-model";
import { setColorPaletteAction } from "../chatWindow/chatWindowSlice.js";

/**
 * Load color palette from the backend.
 * @internal
 */
export function* loadColorPalette(colorPalette?: IColorPalette) {
    try {
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

        const colorPaletteCall = backend.workspace(workspace).styling().getColorPalette;

        const results: Awaited<ReturnType<typeof colorPaletteCall>> = yield call(colorPaletteCall);

        yield put(
            setColorPaletteAction({
                colorPalette: results,
            }),
        );
    } catch (e) {
        //TODO: handle error somehow? Default color palette will be used in this case
        yield put(
            setColorPaletteAction({
                colorPalette: undefined,
            }),
        );
    }
}
