// (C) 2020-2026 GoodData Corporation

import { type IAppState } from "../store/types.js";

export const isMdObjectValidSelector = (state: IAppState): boolean =>
    state.data.isVisualizationMdObjectValid || false;
