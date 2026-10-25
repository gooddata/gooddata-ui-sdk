// (C) 2026 GoodData Corporation

import { type IColorPalette } from "@gooddata/sdk-model";

import { type IAppState } from "../types.js";

/** The domain's input selectors, one per mini-branch mount. */
export const getBootstrapDataState = (state: IAppState) => state.bootstrapData;
export const getProjectIdState = (state: IAppState) => state.projectId;
export const getColorPaletteState = (state: IAppState) => state.colorPalette;
export const getErrorsState = (state: IAppState) => state.appState.errors;
export const getAppReadyState = (state: IAppState) => state.appState.appReady;

/**
 * The insight-editing session id (session_id_reducer.ts) — fresh ids arrive on the
 * bootstrap/refresh actions and the reset carriers. The store holds `null` until the first
 * bootstrap; this boundary converts to `undefined`, the shape every consumer reads.
 */
export const getAppSessionId = (state: IAppState): string | undefined =>
    state.appState.sessionId ?? undefined;

// `|| null` is deliberate: any falsy stored value reads as "no palette".
export function getColorPalette(state: IAppState): IColorPalette | null {
    return getColorPaletteState(state) || null;
}

export const isColorPaletteDefined = (state: IAppState) => !!getColorPalette(state);
