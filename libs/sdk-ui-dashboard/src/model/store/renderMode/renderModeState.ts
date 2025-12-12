// (C) 2021-2023 GoodData Corporation
import { type RenderMode } from "../../../types.js";

/**
 * @beta
 */
export interface RenderModeState {
    renderMode: RenderMode;
}

export const renderModeInitialState: RenderModeState = {
    renderMode: "view",
};
