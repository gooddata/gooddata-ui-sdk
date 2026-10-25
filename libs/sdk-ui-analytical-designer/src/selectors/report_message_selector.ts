// (C) 2007-2026 GoodData Corporation

import { createSelector } from "reselect";

import { getVisualizationClassesState } from "../store/visualization_classes/visualization_classes_selectors.js";

export const reportMessageSelector = createSelector(getVisualizationClassesState, (visualizationClasses) => ({
    // the leaf always exists and seeds to the empty array — the root type says so, and the
    // pristine RESET_FOR_PLUGGABLE_MOUNT state is the reducer's own default build
    visualizationClasses,
}));
