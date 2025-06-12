// (C) 2021-2023 GoodData Corporation
import { RenderMode } from "../../../types.js";

/**
 * @beta
 */
export interface RenderModeState {
    renderMode: RenderMode;
}

export const renderModeInitialState: RenderModeState = {
    renderMode: "view",
};
