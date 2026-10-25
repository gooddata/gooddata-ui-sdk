// (C) 2007-2026 GoodData Corporation

import { getDeviceState, getIsEmbeddedState } from "../store/embedding/embedding_selectors.js";
import { type IAppState } from "../store/types.js";

export function getViewport(state: IAppState) {
    return getDeviceState(state).viewport;
}

export function getDevicePixelRatio(state: IAppState) {
    return getDeviceState(state).pixelRatio;
}

export function getIsMobileDevice(state: IAppState) {
    return getDeviceState(state).isMobile;
}

export function getIsEmbedded(state: IAppState): boolean | undefined {
    return getIsEmbeddedState(state);
}

export function getViewportInfo(state: IAppState) {
    const viewport = getViewport(state);
    const devicePixelRatio = getDevicePixelRatio(state);

    return `(${viewport})*${devicePixelRatio}`;
}
