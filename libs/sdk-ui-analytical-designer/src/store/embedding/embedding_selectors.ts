// (C) 2026 GoodData Corporation

import { isReadOnlyMode } from "../../buildParams.js";
import { type IAppState } from "../types.js";

export const getDeviceState = (state: IAppState) => state.appState.meta.device;
export const getThemeState = (state: IAppState) => state.appState.meta.theme;
export const getIsEmbeddedState = (state: IAppState) => state.appState.meta.isEmbedded;
/** Read-only when the build sets READONLY_MODE or the host sets config.isReadOnly. */
export const getIsReadOnlyMode = (state: IAppState): boolean =>
    isReadOnlyMode() || state.appState.meta.isReadOnly;
export const getIsHostedComponentState = (state: IAppState) => state.appState.meta.isHostedComponent;
