// (C) 2026 GoodData Corporation

import { type IHostNavigationRequest } from "@gooddata/sdk-pluggable-application-model";

import { CreateConfirmUnsavedChangesRequestAction } from "../actions/confirm_unsaved_changes_actions.js";
import { HOST_NAVIGATION } from "../constants/platform.js";
import { store } from "../reduxStore.js";
import { isReportChanging } from "../selectors/confirm_unsaved_changes_dialog_selector.js";
import { hasMetricEditorUnsavedChanges } from "../store/metric_editor/metric_editor_selector.js";

import { setPendingHostNavigation } from "./pendingHostNavigation.js";

export function handleHostNavigationRequest({ proceed }: IHostNavigationRequest): boolean {
    const state = store.getState();
    if (!isReportChanging(state) && !hasMetricEditorUnsavedChanges(state)) {
        return false;
    }

    setPendingHostNavigation(proceed);
    store.dispatch(
        CreateConfirmUnsavedChangesRequestAction({
            active: true,
            data: { goToPage: HOST_NAVIGATION },
        }),
    );
    return true;
}
