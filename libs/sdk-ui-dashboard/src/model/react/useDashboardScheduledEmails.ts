// (C) 2022-2024 GoodData Corporation

import { useCallback, useState } from "react";
import { useToastMessage } from "@gooddata/sdk-ui-kit";
import { IAutomationMetadataObject } from "@gooddata/sdk-model";

import { useDashboardDispatch, useDashboardSelector } from "./DashboardStoreProvider.js";
import {
    selectDashboardRef,
    selectEnableScheduling,
    selectIsInViewMode,
    selectIsReadOnly,
    selectIsScheduleEmailDialogOpen,
    selectIsScheduleEmailManagementDialogOpen,
    selectMenuButtonItemsVisibility,
    uiActions,
} from "../store/index.js";

import { messages } from "../../locales.js";

/**
 * Hook that handles schedule emailing dialogs.
 *
 * @alpha
 */
export const useDashboardScheduledEmails = ({ onReload }: { onReload?: () => void } = {}) => {
    const { addSuccess, addError } = useToastMessage();
    const isScheduleEmailingDialogOpen = useDashboardSelector(selectIsScheduleEmailDialogOpen);
    const isScheduleEmailingManagementDialogOpen = useDashboardSelector(
        selectIsScheduleEmailManagementDialogOpen,
    );
    const dispatch = useDashboardDispatch();
    const dashboardRef = useDashboardSelector(selectDashboardRef);
    const isReadOnly = useDashboardSelector(selectIsReadOnly);
    const isInViewMode = useDashboardSelector(selectIsInViewMode);
    const menuButtonItemsVisibility = useDashboardSelector(selectMenuButtonItemsVisibility);
    const isScheduledEmailingEnabled = useDashboardSelector(selectEnableScheduling);

    const openScheduleEmailingDialog = useCallback(
        () => isScheduledEmailingEnabled && dispatch(uiActions.openScheduleEmailDialog()),
        [dispatch, isScheduledEmailingEnabled],
    );
    const closeScheduleEmailingDialog = useCallback(
        () => isScheduledEmailingEnabled && dispatch(uiActions.closeScheduleEmailDialog()),
        [dispatch, isScheduledEmailingEnabled],
    );
    const openScheduleEmailingManagementDialog = useCallback(
        () => isScheduledEmailingEnabled && dispatch(uiActions.openScheduleEmailManagementDialog()),
        [dispatch, isScheduledEmailingEnabled],
    );
    const closeScheduleEmailingManagementDialog = useCallback(
        () => isScheduledEmailingEnabled && dispatch(uiActions.closeScheduleEmailManagementDialog()),
        [dispatch, isScheduledEmailingEnabled],
    );

    const [scheduledEmailToEdit, setScheduledEmailToEdit] = useState<IAutomationMetadataObject>();

    const isScheduledEmailingVisible =
        isInViewMode &&
        !isReadOnly &&
        isScheduledEmailingEnabled &&
        (menuButtonItemsVisibility.scheduleEmailButton ?? true);

    /*
     * exports and scheduling are not available when rendering a dashboard that is not persisted.
     * this can happen when a new dashboard is created and is being edited.
     *
     * the setup of menu items available in the menu needs to reflect this.
     */
    const defaultOnScheduleEmailing = useCallback(() => {
        if (!dashboardRef) {
            return;
        }

        openScheduleEmailingManagementDialog();
    }, [dashboardRef, openScheduleEmailingManagementDialog]);

    const onScheduleEmailingOpen = useCallback(() => {
        openScheduleEmailingDialog();
    }, [openScheduleEmailingDialog]);

    const onScheduleEmailingCreateError = useCallback(() => {
        closeScheduleEmailingDialog();
        addError(messages.scheduleEmailSubmitError);
    }, [closeScheduleEmailingDialog, addError]);

    const onScheduleEmailingCreateSuccess = useCallback(() => {
        closeScheduleEmailingDialog();
        addSuccess(messages.scheduleEmailSubmitSuccess);
        onReload?.();
    }, [closeScheduleEmailingDialog, addSuccess, onReload]);

    const onScheduleEmailingSaveError = useCallback(() => {
        closeScheduleEmailingDialog();
        addError(messages.scheduleEmailSaveError);
        setScheduledEmailToEdit(undefined);
    }, [closeScheduleEmailingDialog, addError, setScheduledEmailToEdit]);

    const onScheduleEmailingSaveSuccess = useCallback(() => {
        closeScheduleEmailingDialog();
        openScheduleEmailingManagementDialog();
        addSuccess(messages.scheduleEmailSaveSuccess);
        setScheduledEmailToEdit(undefined);
        onReload?.();
    }, [
        closeScheduleEmailingDialog,
        openScheduleEmailingManagementDialog,
        addSuccess,
        setScheduledEmailToEdit,
        onReload,
    ]);

    const onScheduleEmailingCancel = useCallback(() => {
        closeScheduleEmailingDialog();
        openScheduleEmailingManagementDialog();
        setScheduledEmailToEdit(undefined);
    }, [closeScheduleEmailingDialog, openScheduleEmailingManagementDialog, setScheduledEmailToEdit]);

    const onScheduleEmailingManagementDeleteSuccess = useCallback(() => {
        addSuccess(messages.scheduleEmailDeleteSuccess);
        onReload?.();
    }, [addSuccess, onReload]);

    const onScheduleEmailingManagementAdd = useCallback(() => {
        closeScheduleEmailingManagementDialog();
        openScheduleEmailingDialog();
    }, [closeScheduleEmailingManagementDialog, openScheduleEmailingDialog]);

    const onScheduleEmailingManagementEdit = useCallback(
        (schedule: IAutomationMetadataObject) => {
            closeScheduleEmailingManagementDialog();
            setScheduledEmailToEdit(schedule);
            openScheduleEmailingDialog();
        },
        [closeScheduleEmailingManagementDialog, openScheduleEmailingDialog, setScheduledEmailToEdit],
    );

    const onScheduleEmailingManagementClose = useCallback(() => {
        closeScheduleEmailingManagementDialog();
    }, [closeScheduleEmailingManagementDialog]);

    const onScheduleEmailingManagementLoadingError = useCallback(() => {
        closeScheduleEmailingManagementDialog();
        addError(messages.scheduleManagementLoadError);
    }, [closeScheduleEmailingManagementDialog, addError]);

    const onScheduleEmailingManagementDeleteError = useCallback(() => {
        closeScheduleEmailingManagementDialog();
        addError(messages.scheduleManagementDeleteError);
    }, [closeScheduleEmailingManagementDialog, addError]);

    return {
        isScheduledEmailingVisible,
        defaultOnScheduleEmailing,
        isScheduleEmailingDialogOpen,
        isScheduleEmailingManagementDialogOpen,
        onScheduleEmailingOpen,
        onScheduleEmailingManagementEdit,
        scheduledEmailToEdit,
        onScheduleEmailingCancel,
        onScheduleEmailingCreateError,
        onScheduleEmailingCreateSuccess,
        onScheduleEmailingSaveError,
        onScheduleEmailingSaveSuccess,
        onScheduleEmailingManagementAdd,
        onScheduleEmailingManagementClose,
        onScheduleEmailingManagementLoadingError,
        onScheduleEmailingManagementDeleteSuccess,
        onScheduleEmailingManagementDeleteError,
    };
};
