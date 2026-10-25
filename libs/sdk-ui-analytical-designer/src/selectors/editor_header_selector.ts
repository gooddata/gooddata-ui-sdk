// (C) 2007-2026 GoodData Corporation

import { createSelector } from "reselect";

import { canEditVisualization } from "@gooddata/sdk-model";
import { parseStringToArray } from "@gooddata/util";

import { isBranded } from "../selectors/bootstrap_selector.js";
import {
    enableVisualizationPermissions,
    getEnableEmbedButtonInAD,
    isEnableTimezoneChange,
} from "../selectors/feature_flag_selector.js";
import { selectTimeTravel } from "../store/_infra/time_travel.js";
import { getIsReadOnlyMode } from "../store/embedding/embedding_selectors.js";
import { isReportSaving } from "../store/report/report_selectors.js";
import { getRouteQueryDisplayAction, getRouteQueryHideAction } from "../store/router/router_selectors.js";
import { type IAppState } from "../store/types.js";

import { isCsvExportSupported, isXlsxExportSupported } from "./backend_capabilities_selector.js";
import { getIsEmbedded } from "./meta_selector.js";
import {
    canCreateNewVisualization,
    canCreateReport,
    canManageDomain,
    canManageProject,
    workspacePermissions,
} from "./permissions_selector.js";
import {
    getLastSavedReportPermissions,
    isReportLockedSelector,
    isReportSavedSelector,
} from "./report_selector.js";
import { isResetDisabledSelector } from "./reset_button_selector.js";
import { isEditFromKD, isEmbedButtonVisibilityForcedByURLParam, isExploreFromKD } from "./route_selector.js";

export enum AVAILABLE_HIDDEN_ACTIONS {
    UNDO_REDO = "undoRedo",
    CLEAR = "clear",
    OPEN = "open",
    SAVE_AS = "saveAs",
    SAVE = "save",
    EXPORT = "export",
    OPEN_IN_ANALYTICAL_DESIGNER = "openInAnalyticalDesigner",
}

export enum AVAILABLE_DISPLAYED_ACTIONS {
    CANCEL = "cancel",
}

// Derived from the in-store history — there are no `appState.undo` / `appState.redo`
// flags to keep in sync anymore. Both feed the postMessage availableCommands selector
// (postMessageApi/state/selectors/post_message_context_selector.ts) unchanged.
export const undoPossible = (state: IAppState): boolean => selectTimeTravel(state).past.length > 0;
export const redoPossible = (state: IAppState): boolean => selectTimeTravel(state).future.length > 0;
export const reportSaving = (state: IAppState): boolean => isReportSaving(state);

export const isUndoDisabled = createSelector(undoPossible, reportSaving, (isUndoPossible, isReportSaving) => {
    return !isUndoPossible || isReportSaving;
});

export const isRedoDisabled = createSelector(redoPossible, reportSaving, (isRedoPossible, isReportSaving) => {
    return !isRedoPossible || isReportSaving;
});

const hideActionRawValues = (state: IAppState) => getRouteQueryHideAction(state);
const displayActionRawValues = (state: IAppState) => getRouteQueryDisplayAction(state);

export const hiddenActions = createSelector(
    getIsEmbedded,
    hideActionRawValues,
    (isEmbedded, hideActionRawValues) => {
        if (!isEmbedded) {
            return [];
        }
        return parseStringToArray(hideActionRawValues) || [];
    },
);

export const displayedActions = createSelector(
    getIsEmbedded,
    displayActionRawValues,
    (isEmbedded, displayActionRawValues) => {
        if (!isEmbedded) {
            return [];
        }
        return parseStringToArray(displayActionRawValues) || [];
    },
);

export const isOptionsMenuEnabled = createSelector(
    getIsEmbedded,
    isCsvExportSupported,
    isXlsxExportSupported,
    canCreateReport,
    hiddenActions,
    isEditFromKD,
    isEnableTimezoneChange,
    (
        isEmbedded,
        hasCsvSupport,
        hasXlsxSupport,
        canCreateReport,
        hiddenActions,
        isEditFromKD,
        isEnableTimezoneChange,
    ) => {
        const isExportHidden = hiddenActions.includes(AVAILABLE_HIDDEN_ACTIONS.EXPORT);
        const isOpenInADVisible = !hiddenActions.includes(
            AVAILABLE_HIDDEN_ACTIONS.OPEN_IN_ANALYTICAL_DESIGNER,
        );
        const isExportCsvVisible = !isExportHidden && hasCsvSupport;
        const isExportXlsxVisible = !isExportHidden && hasXlsxSupport;
        const isExportGroupVisible = isExportCsvVisible || isExportXlsxVisible;
        const createReportPossible = !isEmbedded && canCreateReport;

        return (
            (isEditFromKD && (isOpenInADVisible || isExportGroupVisible)) ||
            isExportGroupVisible ||
            createReportPossible ||
            isEnableTimezoneChange
        );
    },
);

// Save updates a saved visualization, which needs the right to edit it (the workspace role, or behind
// the visualization permissions flag the object's own EDIT), and creates an unsaved one, which needs
// the right to create. A lock refuses both.
export const canSaveReport = createSelector(
    isReportLockedSelector,
    isReportSavedSelector,
    getLastSavedReportPermissions,
    workspacePermissions,
    enableVisualizationPermissions,
    canCreateNewVisualization,
    (
        isReportLocked,
        isReportSaved,
        permissions,
        workspacePermissions,
        visualizationPermissionsEnabled,
        canCreateNewVisualization,
    ) =>
        !isReportLocked &&
        (isReportSaved
            ? workspacePermissions !== null &&
              canEditVisualization(permissions, workspacePermissions, visualizationPermissionsEnabled)
            : canCreateNewVisualization),
);

export const isSaveVisible = createSelector(
    hiddenActions,
    canSaveReport,
    isExploreFromKD,
    getIsReadOnlyMode,
    (hiddenActions, canSaveReport, isExploreFromKD, isReadOnlyMode) =>
        // a draft explored from a dashboard offers Save even when the host hides the action
        !isReadOnlyMode &&
        canSaveReport &&
        (isExploreFromKD || !hiddenActions.includes(AVAILABLE_HIDDEN_ACTIONS.SAVE)),
);

export const isSaveAsVisible = createSelector(
    hiddenActions,
    canCreateNewVisualization,
    isReportSavedSelector,
    getIsReadOnlyMode,
    (hiddenActions, canCreateNewVisualization, isReportSaved, isReadOnlyMode) =>
        !isReadOnlyMode &&
        !hiddenActions.includes(AVAILABLE_HIDDEN_ACTIONS.SAVE_AS) &&
        isReportSaved &&
        canCreateNewVisualization,
);

export const isEditorHeaderResetDisabled = createSelector(
    isResetDisabledSelector,
    reportSaving,
    (isResetDisabled: boolean, isReportSaving: boolean) => {
        return isResetDisabled || isReportSaving;
    },
);

export const isEmbedButtonVisible = createSelector(
    isBranded,
    getEnableEmbedButtonInAD,
    canManageDomain,
    canManageProject,
    getIsEmbedded,
    isEmbedButtonVisibilityForcedByURLParam,
    (
        isBranded: boolean,
        isEmbedButtonEnabled: boolean,
        canManageDomain: boolean,
        canManageProject: boolean,
        isEmbedded: boolean,
        isEmbedButtonVisibilityForcedByURLParam: boolean,
    ) => {
        return (
            isEmbedButtonEnabled &&
            (!isEmbedded || isEmbedButtonVisibilityForcedByURLParam) &&
            (canManageDomain || canManageProject) &&
            !isBranded
        );
    },
);
