// (C) 2021-2022 GoodData Corporation
import { RenderMode } from "../../../types";

/**
 * @alpha
 */
export interface RenderModeState {
    renderMode: RenderMode;
}

export const renderModeInitialState: RenderModeState = {
    renderMode: "view",
};
