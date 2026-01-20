// (C) 2021-2026 GoodData Corporation

import { type RenderMode } from "../../../types.js";

/**
 * @beta
 */
export interface IRenderModeState {
    renderMode: RenderMode;
}

export const renderModeInitialState: IRenderModeState = {
    renderMode: "view",
};
