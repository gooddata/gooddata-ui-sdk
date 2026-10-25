// (C) 2021-2026 GoodData Corporation

import { type IMetricInfo } from "@gooddata/sdk-ui-metric-component";

import { type IConfirmUnsavedChangesDialogActionPayloadData } from "../../actions/confirm_unsaved_changes_actions.js";

export interface IMetricEditorState {
    metrics: IMetricInfo[];
    activeIndex?: number;
    minimized: boolean;
    hasUnsavedChanges: boolean;
    saveAllRequestNumber: number;
    unsavedChangesData?: IConfirmUnsavedChangesDialogActionPayloadData;
}
