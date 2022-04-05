// (C) 2022 GoodData Corporation

import { useCallback } from "react";
import { useToastMessage } from "@gooddata/sdk-ui-kit";
import { ObjRef } from "@gooddata/sdk-model";
import {
    selectCanCreateScheduledMail,
    selectDashboardRef,
    selectEnableInsightExportScheduling,
    selectEnableKPIDashboardSchedule,
    selectIsReadOnly,
    selectIsScheduleEmailDialogOpen,
    selectIsScheduleEmailManagementDialogOpen,
    selectMenuButtonItemsVisibility,
    uiActions,
} from "../store";
import { useDashboardDispatch, useDashboardSelector } from "./DashboardStoreProvider";

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
    const canCreateScheduledMail = useDashboardSelector(selectCanCreateScheduledMail);
    const isScheduledEmailingEnabled = !!useDashboardSelector(selectEnableKPIDashboardSchedule);
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

    const isScheduledEmailingVisible =
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

    const onScheduleEmailingError = useCallback(() => {
        closeScheduleEmailingDialog();
        addError({ id: "dialogs.schedule.email.submit.error" });
    }, []);

    const onScheduleEmailingSuccess = useCallback(() => {
        closeScheduleEmailingDialog();
        addSuccess({ id: "dialogs.schedule.email.submit.success" });
        resetScheduledEmailDefaultAttachment();
    }, []);

    const onScheduleEmailingCancel = useCallback(() => {
        closeScheduleEmailingDialog();
        openScheduleEmailingManagementDialog();
        resetScheduledEmailDefaultAttachment();
    }, []);

    const onScheduleEmailingManagementDeleteSuccess = useCallback(() => {
        addSuccess({ id: "dialogs.schedule.email.delete.success" });
    }, []);

    const onScheduleEmailingManagementAdd = useCallback(() => {
        closeScheduleEmailingManagementDialog();
        openScheduleEmailingDialog();
    }, []);

    const onScheduleEmailingManagementClose = useCallback(() => {
        closeScheduleEmailingManagementDialog();
    }, []);

    const onScheduleEmailingManagementLoadingError = useCallback(() => {
        closeScheduleEmailingManagementDialog();
        addError({ id: "dialogs.schedule.management.load.error" });
    }, []);

    const onScheduleEmailingManagementDeleteError = useCallback(() => {
        closeScheduleEmailingManagementDialog();
        addError({ id: "dialogs.schedule.management.delete.error" });
    }, []);

    return {
        isScheduledEmailingVisible,
        enableInsightExportScheduling,
        defaultOnScheduleEmailing,
        isScheduleEmailingDialogOpen,
        isScheduleEmailingManagementDialogOpen,
        onScheduleEmailingOpen,
        onScheduleEmailingCancel,
        onScheduleEmailingError,
        onScheduleEmailingSuccess,
        onScheduleEmailingManagementAdd,
        onScheduleEmailingManagementClose,
        onScheduleEmailingManagementLoadingError,
        onScheduleEmailingManagementDeleteSuccess,
        onScheduleEmailingManagementDeleteError,
    };
};
