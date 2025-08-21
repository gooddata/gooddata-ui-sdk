// (C) 2019-2025 GoodData Corporation
import React, { ReactElement, useCallback } from "react";

import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { SaveAsDialogRenderer } from "./SaveAsDialogRenderer.js";
import { useSaveAs } from "./useSaveAs.js";
import { messages } from "../../../locales.js";
import {
    selectIsSaveAsDialogOpen,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model/index.js";
import { ISaveAsDialogProps } from "../types.js";

/**
 * @internal
 */
export function useSaveAsDialogProps(): ISaveAsDialogProps {
    const { addSuccess, addError } = useToastMessage();

    const dispatch = useDashboardDispatch();
    const closeSaveAsDialog = useCallback(() => dispatch(uiActions.closeSaveAsDialog()), [dispatch]);

    const isSaveAsDialogOpen = useDashboardSelector(selectIsSaveAsDialogOpen);

    const onSaveAsError = useCallback(() => {
        closeSaveAsDialog();
        addError(messages.messagesDashboardSaveFailed, { id: "message_dashboard_save_failed" });
    }, [closeSaveAsDialog, addError]);

    const onSaveAsSuccess = useCallback(() => {
        closeSaveAsDialog();
        addSuccess(messages.messagesDashboardSaveSuccess, { id: "message_dashboard_save_success" });
    }, [closeSaveAsDialog, addSuccess]);

    const onSaveAsCancel = useCallback(() => {
        closeSaveAsDialog();
    }, [closeSaveAsDialog]);

    return {
        isVisible: isSaveAsDialogOpen,
        onCancel: onSaveAsCancel,
        onError: onSaveAsError,
        onSuccess: onSaveAsSuccess,
    };
}

/**
 * @alpha
 */
export function DefaultSaveAsDialog(props: ISaveAsDialogProps): ReactElement | null {
    const { onSubmit, onCancel, onError, isVisible, onSuccess } = props;

    const {
        locale,
        dashboardTitle,
        isKpiWidgetEnabled,
        isScheduleEmailsEnabled,
        isDashboardSaving,
        isDashboardLoaded,
        handleSaveAs,
        isInEditMode,
    } = useSaveAs({ onSubmit, onSubmitSuccess: onSuccess, onSubmitError: onError });

    if (!isVisible) {
        return null;
    }

    return (
        <SaveAsDialogRenderer
            locale={locale}
            dashboardTitle={dashboardTitle}
            isKpiWidgetEnabled={isKpiWidgetEnabled}
            isDashboardLoaded={isDashboardLoaded}
            isDashboardSaving={isDashboardSaving}
            isScheduleEmailsEnabled={isScheduleEmailsEnabled}
            isInEditMode={isInEditMode}
            onSubmit={handleSaveAs}
            onCancel={onCancel}
        />
    );
}
