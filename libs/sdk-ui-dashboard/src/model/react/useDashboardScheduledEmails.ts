// (C) 2022 GoodData Corporation

import { useCallback, useState } from "react";
import { useToastMessage } from "@gooddata/sdk-ui-kit";
import { IScheduledMail, IWorkspaceUser, ObjRef } from "@gooddata/sdk-model";

import { useDashboardDispatch, useDashboardSelector } from "./DashboardStoreProvider.js";
import {
    selectCanCreateScheduledMail,
    selectDashboardRef,
    selectEnableInsightExportScheduling,
    selectEnableKPIDashboardSchedule,
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
export const useDashboardScheduledEmails = () => {
    const { addSuccess, addError } = useToastMessage();
    const isScheduleEmailingDialogOpen = useDashboardSelector(selectIsScheduleEmailDialogOpen);
    const isScheduleEmailingManagementDialogOpen = useDashboardSelector(
        selectIsScheduleEmailManagementDialogOpen,
    );
    const dispatch = useDashboardDispatch();
    const dashboardRef = useDashboardSelector(selectDashboardRef);
    const enableInsightExportScheduling = useDashboardSelector(selectEnableInsightExportScheduling);
    const isReadOnly = useDashboardSelector(selectIsReadOnly);
    const isInViewMode = useDashboardSelector(selectIsInViewMode);
    const canCreateScheduledMail = useDashboardSelector(selectCanCreateScheduledMail);
    const isScheduledEmailingEnabled = useDashboardSelector(selectEnableKPIDashboardSchedule);
    const menuButtonItemsVisibility = useDashboardSelector(selectMenuButtonItemsVisibility);

    const openScheduleEmailingDialog = () => dispatch(uiActions.openScheduleEmailDialog());
    const closeScheduleEmailingDialog = () => dispatch(uiActions.closeScheduleEmailDialog());
    const openScheduleEmailingManagementDialog = () =>
        enableInsightExportScheduling && dispatch(uiActions.openScheduleEmailManagementDialog());
    const closeScheduleEmailingManagementDialog = () =>
        enableInsightExportScheduling && dispatch(uiActions.closeScheduleEmailManagementDialog());
    const setScheduledEmailDefaultAttachment = (attachmentRef: ObjRef) =>
        enableInsightExportScheduling &&
        dispatch(uiActions.setScheduleEmailDialogDefaultAttachment(attachmentRef));
    const resetScheduledEmailDefaultAttachment = () =>
        enableInsightExportScheduling && dispatch(uiActions.resetScheduleEmailDialogDefaultAttachment());
    const [scheduledEmailToEdit, setScheduledEmailToEdit] = useState<IScheduledMail>();
    const [users, setUsers] = useState<IWorkspaceUser[]>([]);

    const isScheduledEmailingVisible =
        isInViewMode &&
        !isReadOnly &&
        canCreateScheduledMail &&
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

        if (enableInsightExportScheduling) {
            openScheduleEmailingManagementDialog();
        } else {
            openScheduleEmailingDialog();
        }
    }, [dashboardRef, enableInsightExportScheduling]);

    const onScheduleEmailingOpen = useCallback((attachmentRef?: ObjRef) => {
        openScheduleEmailingDialog();
        attachmentRef && setScheduledEmailDefaultAttachment(attachmentRef);
    }, []);

    const onScheduleEmailingCreateError = useCallback(() => {
        closeScheduleEmailingDialog();
        addError(messages.scheduleEmailSubmitError);
    }, []);

    const onScheduleEmailingCreateSuccess = useCallback(() => {
        closeScheduleEmailingDialog();
        addSuccess(messages.scheduleEmailSubmitSuccess);
        resetScheduledEmailDefaultAttachment();
    }, []);

    const onScheduleEmailingSaveError = useCallback(() => {
        closeScheduleEmailingDialog();
        addError(messages.scheduleEmailSaveError);
        setScheduledEmailToEdit(undefined);
    }, []);

    const onScheduleEmailingSaveSuccess = useCallback(() => {
        closeScheduleEmailingDialog();
        openScheduleEmailingManagementDialog();
        addSuccess(messages.scheduleEmailSaveSuccess);
        setScheduledEmailToEdit(undefined);
    }, []);

    const onScheduleEmailingCancel = useCallback(() => {
        closeScheduleEmailingDialog();
        openScheduleEmailingManagementDialog();
        resetScheduledEmailDefaultAttachment();
        setScheduledEmailToEdit(undefined);
    }, []);

    const onScheduleEmailingManagementDeleteSuccess = useCallback(() => {
        addSuccess(messages.scheduleEmailDeleteSuccess);
    }, []);

    const onScheduleEmailingManagementAdd = useCallback(() => {
        closeScheduleEmailingManagementDialog();
        openScheduleEmailingDialog();
    }, []);

    const onScheduleEmailingManagementEdit = useCallback(
        (schedule: IScheduledMail, users: IWorkspaceUser[]) => {
            closeScheduleEmailingManagementDialog();
            setScheduledEmailToEdit(schedule);
            setUsers(users);
            openScheduleEmailingDialog();
        },
        [],
    );

    const onScheduleEmailingManagementClose = useCallback(() => {
        closeScheduleEmailingManagementDialog();
    }, []);

    const onScheduleEmailingManagementLoadingError = useCallback(() => {
        closeScheduleEmailingManagementDialog();
        addError(messages.scheduleManagementLoadError);
    }, []);

    const onScheduleEmailingManagementDeleteError = useCallback(() => {
        closeScheduleEmailingManagementDialog();
        addError(messages.scheduleManagementDeleteError);
    }, []);

    return {
        isScheduledEmailingVisible,
        enableInsightExportScheduling,
        defaultOnScheduleEmailing,
        isScheduleEmailingDialogOpen,
        isScheduleEmailingManagementDialogOpen,
        onScheduleEmailingOpen,
        onScheduleEmailingManagementEdit,
        scheduledEmailToEdit,
        users,
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
