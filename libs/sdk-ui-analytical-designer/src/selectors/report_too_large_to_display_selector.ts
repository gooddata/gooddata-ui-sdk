// (C) 2007-2026 GoodData Corporation

import { createSelector } from "reselect";

import { getVisualizationClassTypeFromState } from "../services/visualization_class_service.js";
import { type IVisualizationClassesState } from "../store/visualization_classes/visualization_classes_state.js";

import { reportMessageSelector } from "./report_message_selector.js";

export const currentVisualizationTypeSelector = createSelector(
    getVisualizationClassTypeFromState,
    (type) => type,
);

export const visualizationClassesSelector = createSelector(
    reportMessageSelector,
    ({ visualizationClasses }): IVisualizationClassesState => visualizationClasses,
);

export const reportTooLargeToDisplaySelector = createSelector(
    reportMessageSelector,
    currentVisualizationTypeSelector,
    (visualizationClasses, currentVisualizationType) => ({
        ...visualizationClasses,
        currentVisualizationType,
    }),
);
