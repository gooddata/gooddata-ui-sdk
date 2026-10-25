// (C) 2007-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type IMeasureMetadataObject, type ObjRef } from "@gooddata/sdk-model";
import { type IMetricInfoDraft, type ISaveMetricInfo } from "@gooddata/sdk-ui-metric-component";

import { type IConfirmUnsavedChangesDialogActionPayloadData } from "../../actions/confirm_unsaved_changes_actions.js";

import { createTabIdentifier } from "./metric_editor_services.js";

export enum MetricEditorActionTypeKeys {
    METRIC_EDITOR_OPEN = "STORE/METRIC_EDITOR_OPEN",
    METRIC_EDITOR_OPEN_NEW = "STORE/METRIC_EDITOR_OPEN_NEW",
    METRIC_EDITOR_FOCUS_TAB = "STORE/METRIC_EDITOR_FOCUS_TAB",
    METRIC_EDITOR_MINIMIZE = "STORE/METRIC_EDITOR_MINIMIZE",
    METRIC_EDITOR_MAXIMIZE = "STORE/METRIC_EDITOR_MAXIMIZE",
    METRIC_EDITOR_CLOSE_TABS = "STORE/METRIC_EDITOR_CLOSE_TAB",
    METRIC_EDITOR_OPEN_TAB_WITH_METRIC = "STORE/METRIC_EDITOR_OPEN_TAB_WITH_METRIC",
    METRIC_EDITOR_OPEN_TAB_FROM_DIALOG = "STORE/METRIC_EDITOR_OPEN_TAB_FROM_DIALOG",
    METRIC_EDITOR_METRIC_SAVED = "STORE/METRIC_EDITOR_METRIC_SAVED",
    METRIC_EDITOR_METRIC_SAVE_ERROR = "STORE/METRIC_EDITOR_METRIC_SAVE_ERROR",
    METRIC_EDITOR_METRIC_DELETED = "STORE/METRIC_EDITOR_METRIC_DELETED",
    METRIC_EDITOR_METRIC_DELETE_ERROR = "STORE/METRIC_EDITOR_METRIC_DELETE_ERROR",
    METRIC_EDITOR_UNSAVED_CHANGES = "STORE/METRIC_EDITOR_UNSAVED_CHANGES",
    METRIC_EDITOR_UNSAVED_CHANGES_OPEN = "STORE/METRIC_EDITOR_UNSAVED_CHANGES_OPEN",
    METRIC_EDITOR_UNSAVED_CHANGES_CANCEL = "STORE/METRIC_EDITOR_UNSAVED_CHANGES_CANCEL",
}

export type TFormMode = "new" | "edit";
export type TMetricEditorOpenNewFrom = "CREATE_METRIC_BUTTON" | "OPEN_NEW_TAB";

export const metricEditorUnsavedChanges = createAction(
    MetricEditorActionTypeKeys.METRIC_EDITOR_UNSAVED_CHANGES,
    (unsaved: boolean) => ({ payload: unsaved }),
);

export const metricEditorShowUnsavedChangesDialog = createAction(
    MetricEditorActionTypeKeys.METRIC_EDITOR_UNSAVED_CHANGES_OPEN,
    (payload: IConfirmUnsavedChangesDialogActionPayloadData) => ({ payload }),
);

export const metricEditorCancelUnsavedChangesDialog = createAction(
    MetricEditorActionTypeKeys.METRIC_EDITOR_UNSAVED_CHANGES_CANCEL,
);

export const metricEditorOpen = createAction(
    MetricEditorActionTypeKeys.METRIC_EDITOR_OPEN,
    (metricRef: ObjRef) => ({ payload: metricRef }),
);

export const metricEditorOpenFromDialog = createAction(
    MetricEditorActionTypeKeys.METRIC_EDITOR_OPEN_TAB_FROM_DIALOG,
    (metricInfoDraft: IMetricInfoDraft) => ({ payload: metricInfoDraft }),
);

export const metricEditorOpenNew = createAction(
    MetricEditorActionTypeKeys.METRIC_EDITOR_OPEN_NEW,
    (source: TMetricEditorOpenNewFrom) => ({ payload: source }),
);

export const metricEditorFocusTab = createAction(
    MetricEditorActionTypeKeys.METRIC_EDITOR_FOCUS_TAB,
    (tabId: string) => ({ payload: tabId }),
);

/** Focusing BY METRIC is the same event with the tab id derived — a call, not a second creator. */
export const metricEditorFocusMetric = (metricRef: ObjRef) =>
    metricEditorFocusTab(createTabIdentifier(metricRef));

export const metricEditorMinimize = createAction(MetricEditorActionTypeKeys.METRIC_EDITOR_MINIMIZE);

export const metricEditorMaximize = createAction(MetricEditorActionTypeKeys.METRIC_EDITOR_MAXIMIZE);

export const metricEditorCloseTabs = createAction(
    MetricEditorActionTypeKeys.METRIC_EDITOR_CLOSE_TABS,
    (tabsId: string[]) => ({ payload: tabsId }),
);

export const metricEditorOpenTabWithMetric = createAction(
    MetricEditorActionTypeKeys.METRIC_EDITOR_OPEN_TAB_WITH_METRIC,
    (metric: IMeasureMetadataObject) => ({ payload: metric }),
);

export const metricEditorMetricDeleted = createAction(
    MetricEditorActionTypeKeys.METRIC_EDITOR_METRIC_DELETED,
    (metric: IMeasureMetadataObject) => ({ payload: metric }),
);

export const metricEditorMetricDeleteError = createAction(
    MetricEditorActionTypeKeys.METRIC_EDITOR_METRIC_DELETE_ERROR,
    (metric: IMeasureMetadataObject, error: Error) => ({ payload: { metric, error } }),
);

export const metricEditorMetricSaved = createAction(
    MetricEditorActionTypeKeys.METRIC_EDITOR_METRIC_SAVED,
    (metric: IMeasureMetadataObject, info: ISaveMetricInfo, mode: TFormMode) => ({
        payload: { metric, info, mode },
    }),
);

export const metricEditorMetricSaveError = createAction(
    MetricEditorActionTypeKeys.METRIC_EDITOR_METRIC_SAVE_ERROR,
    (metric: IMeasureMetadataObject, error: Error) => ({ payload: { metric, error } }),
);

export type IMetricEditorOpenAction = ReturnType<typeof metricEditorOpen>;
export type IMetricEditorOpenFromDialogAction = ReturnType<typeof metricEditorOpenFromDialog>;
export type IMetricEditorOpenNewAction = ReturnType<typeof metricEditorOpenNew>;
export type IMetricEditorFocusTabAction = ReturnType<typeof metricEditorFocusTab>;
export type IMetricEditorMinimizeAction = ReturnType<typeof metricEditorMinimize>;
export type IMetricEditorMaximizeAction = ReturnType<typeof metricEditorMaximize>;
export type IMetricEditorCloseTabAction = ReturnType<typeof metricEditorCloseTabs>;
export type IMetricEditorOpenTabWithMetricAction = ReturnType<typeof metricEditorOpenTabWithMetric>;

export type IMetricEditorMetricDeletedAction = ReturnType<typeof metricEditorMetricDeleted>;
export type IMetricEditorMetricDeleteErrorAction = ReturnType<typeof metricEditorMetricDeleteError>;
export type IMetricEditorMetricSaveAction = ReturnType<typeof metricEditorMetricSaved>;
export type IMetricEditorMetricSaveErrorAction = ReturnType<typeof metricEditorMetricSaveError>;

export type IMetricEditorShowUnsavedChangesDialogAction = ReturnType<
    typeof metricEditorShowUnsavedChangesDialog
>;
export type IMetricEditorCancelUnsavedChangesDialogAction = ReturnType<
    typeof metricEditorCancelUnsavedChangesDialog
>;
export type IMetricEditorUnsavedChanges = ReturnType<typeof metricEditorUnsavedChanges>;

export type IMetricEditorAction =
    | IMetricEditorOpenAction
    | IMetricEditorOpenFromDialogAction
    | IMetricEditorOpenNewAction
    | IMetricEditorFocusTabAction
    | IMetricEditorMinimizeAction
    | IMetricEditorMaximizeAction
    | IMetricEditorCloseTabAction
    | IMetricEditorOpenTabWithMetricAction
    | IMetricEditorMetricDeletedAction
    | IMetricEditorMetricDeleteErrorAction
    | IMetricEditorMetricSaveAction
    | IMetricEditorMetricSaveErrorAction
    | IMetricEditorUnsavedChanges
    | IMetricEditorShowUnsavedChangesDialogAction
    | IMetricEditorCancelUnsavedChangesDialogAction;
