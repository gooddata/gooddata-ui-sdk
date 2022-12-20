// (C) 2019-2022 GoodData Corporation
import React, { useCallback } from "react";
import { useToastMessage } from "@gooddata/sdk-ui-kit";
import { ISaveAsDialogProps } from "../types";
import { useSaveAs } from "./useSaveAs";
import { SaveAsDialogRenderer } from "./SaveAsDialogRenderer";
import { messages } from "../../../locales";
import {
    changeRenderMode,
    selectIsSaveAsDialogOpen,
    uiActions,
    useDashboardCommandProcessing,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model";

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
        addError(messages.messagesDashboardSaveFailed);
    }, [closeSaveAsDialog, addError]);

    const { run: changeEditMode } = useDashboardCommandProcessing({
        commandCreator: changeRenderMode,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.RENDER_MODE.CHANGED",
        onSuccess: () => {
            addSuccess(messages.messagesDashboardSaveSuccess);
        },
    });

    const onSaveAsSuccess = useCallback(() => {
        closeSaveAsDialog();
        // need wait till change mode is finished
        changeEditMode("view", { resetDashboard: false });
    }, [closeSaveAsDialog, changeEditMode]);

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
export const DefaultSaveAsDialog = (props: ISaveAsDialogProps): JSX.Element | null => {
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
};
