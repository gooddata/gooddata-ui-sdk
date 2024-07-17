// (C) 2022-2024 GoodData Corporation

import { useCallback, useState } from "react";
import { useToastMessage } from "@gooddata/sdk-ui-kit";
import { IAutomationMetadataObject, IWidget } from "@gooddata/sdk-model";

import { useDashboardDispatch, useDashboardSelector } from "./DashboardStoreProvider.js";
import {
    selectCanExportPdf,
    selectCanManageWorkspace,
    selectDashboardRef,
    selectEnableScheduling,
    selectIsInViewMode,
    selectIsReadOnly,
    selectIsScheduleEmailDialogOpen,
    selectIsScheduleEmailManagementDialogOpen,
    selectIsScheduleEmailDialogContext,
    selectIsScheduleEmailManagementDialogContext,
    selectMenuButtonItemsVisibility,
    selectWebhooks,
    uiActions,
} from "../store/index.js";

import { messages } from "../../locales.js";
import { useWorkspaceAutomations } from "./useWorkspaceAutomations.js";

/**
 * Hook that handles schedule emailing dialogs.
 *
 * @alpha
 */
export const useDashboardScheduledEmails = ({ onReload }: { onReload?: () => void } = {}) => {
    const { addSuccess, addError } = useToastMessage();

    const isScheduleEmailingDialogOpen = useDashboardSelector(selectIsScheduleEmailDialogOpen) || false;
    const scheduleEmailingDialogContext = useDashboardSelector(selectIsScheduleEmailDialogContext);
    const isScheduleEmailingManagementDialogOpen =
        useDashboardSelector(selectIsScheduleEmailManagementDialogOpen) || false;
    const scheduleEmailingManagementDialogContext = useDashboardSelector(
        selectIsScheduleEmailManagementDialogContext,
    );

    const dispatch = useDashboardDispatch();
    const dashboardRef = useDashboardSelector(selectDashboardRef);
    const isReadOnly = useDashboardSelector(selectIsReadOnly);
    const isInViewMode = useDashboardSelector(selectIsInViewMode);
    const menuButtonItemsVisibility = useDashboardSelector(selectMenuButtonItemsVisibility);
    const isScheduledEmailingEnabled = useDashboardSelector(selectEnableScheduling);
    const canExport = useDashboardSelector(selectCanExportPdf);
    const webhooks = useDashboardSelector(selectWebhooks);
    const numberOfAvailableWebhooks = webhooks.length;
    const isWorkspaceManager = useDashboardSelector(selectCanManageWorkspace);
    /**
     * We want to hide scheduling when there are no webhooks unless the user is admin.
     */
    const showDueToNumberOfAvailableWebhooks = numberOfAvailableWebhooks > 0 || isWorkspaceManager;

    const { result } = useWorkspaceAutomations({
        enable: isScheduledEmailingEnabled,
    });

    const openScheduleEmailingDialog = useCallback(
        (widget?: IWidget) =>
            isScheduledEmailingEnabled && dispatch(uiActions.openScheduleEmailDialog({ widget })),
        [dispatch, isScheduledEmailingEnabled],
    );
    const closeScheduleEmailingDialog = useCallback(
        () => isScheduledEmailingEnabled && dispatch(uiActions.closeScheduleEmailDialog()),
        [dispatch, isScheduledEmailingEnabled],
    );
    const openScheduleEmailingManagementDialog = useCallback(
        (widget?: IWidget) =>
            isScheduledEmailingEnabled && dispatch(uiActions.openScheduleEmailManagementDialog({ widget })),
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
        canExport &&
        showDueToNumberOfAvailableWebhooks &&
        (menuButtonItemsVisibility.scheduleEmailButton ?? true);

    const isScheduledManagementEmailingVisible = isScheduledEmailingVisible && (result ?? []).length > 0;

    /*
     * exports and scheduling are not available when rendering a dashboard that is not persisted.
     * this can happen when a new dashboard is created and is being edited.
     *
     * the setup of menu items available in the menu needs to reflect this.
     */
    const defaultOnScheduleEmailingManagement = useCallback(
        (widget?: IWidget) => {
            if (!dashboardRef) {
                return;
            }

            openScheduleEmailingManagementDialog(widget);
        },
        [dashboardRef, openScheduleEmailingManagementDialog],
    );

    const defaultOnScheduleEmailing = useCallback(
        (widget?: IWidget) => {
            if (!dashboardRef) {
                return;
            }

            openScheduleEmailingDialog(widget);
        },
        [dashboardRef, openScheduleEmailingDialog],
    );

    const onScheduleEmailingOpen = useCallback(
        (widget?: IWidget) => {
            openScheduleEmailingDialog(widget);
        },
        [openScheduleEmailingDialog],
    );

    const onScheduleEmailingManagementOpen = useCallback(
        (widget?: IWidget) => {
            openScheduleEmailingManagementDialog(widget);
        },
        [openScheduleEmailingManagementDialog],
    );

    const onScheduleEmailingCreateError = useCallback(() => {
        closeScheduleEmailingDialog();
        addError(messages.scheduleEmailSubmitError);
    }, [closeScheduleEmailingDialog, addError]);

    const onScheduleEmailingCreateSuccess = useCallback(
        (widget?: IWidget) => {
            closeScheduleEmailingDialog();
            openScheduleEmailingManagementDialog(widget);
            addSuccess(messages.scheduleEmailSubmitSuccess);
            onReload?.();
        },
        [closeScheduleEmailingDialog, openScheduleEmailingManagementDialog, addSuccess, onReload],
    );

    const onScheduleEmailingSaveError = useCallback(() => {
        closeScheduleEmailingDialog();
        addError(messages.scheduleEmailSaveError);
        setScheduledEmailToEdit(undefined);
    }, [closeScheduleEmailingDialog, addError, setScheduledEmailToEdit]);

    const onScheduleEmailingSaveSuccess = useCallback(
        (widget?: IWidget) => {
            closeScheduleEmailingDialog();
            openScheduleEmailingManagementDialog(widget);
            addSuccess(messages.scheduleEmailSaveSuccess);
            setScheduledEmailToEdit(undefined);
            onReload?.();
        },
        [
            closeScheduleEmailingDialog,
            openScheduleEmailingManagementDialog,
            addSuccess,
            setScheduledEmailToEdit,
            onReload,
        ],
    );

    const onScheduleEmailingCancel = useCallback(
        (widget?: IWidget) => {
            closeScheduleEmailingDialog();
            setScheduledEmailToEdit(undefined);
            openScheduleEmailingManagementDialog(widget);
        },
        [closeScheduleEmailingDialog, openScheduleEmailingManagementDialog, setScheduledEmailToEdit],
    );

    const onScheduleEmailingManagementDeleteSuccess = useCallback(() => {
        closeScheduleEmailingDialog();
        addSuccess(messages.scheduleEmailDeleteSuccess);
        onReload?.();
    }, [addSuccess, closeScheduleEmailingDialog, onReload]);

    const onScheduleEmailingManagementAdd = useCallback(
        (widget?: IWidget) => {
            closeScheduleEmailingManagementDialog();
            openScheduleEmailingDialog(widget);
        },
        [closeScheduleEmailingManagementDialog, openScheduleEmailingDialog],
    );

    const onScheduleEmailingManagementEdit = useCallback(
        (schedule: IAutomationMetadataObject, widget?: IWidget) => {
            closeScheduleEmailingManagementDialog();
            setScheduledEmailToEdit(schedule);
            openScheduleEmailingDialog(widget);
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
        closeScheduleEmailingDialog();
        closeScheduleEmailingManagementDialog();
        addError(messages.scheduleManagementDeleteError);
    }, [closeScheduleEmailingDialog, closeScheduleEmailingManagementDialog, addError]);

    return {
        isScheduledEmailingVisible,
        isScheduledManagementEmailingVisible,
        defaultOnScheduleEmailing,
        defaultOnScheduleEmailingManagement,
        isScheduleEmailingDialogOpen,
        isScheduleEmailingManagementDialogOpen,
        scheduleEmailingDialogContext,
        scheduleEmailingManagementDialogContext,
        onScheduleEmailingOpen,
        onScheduleEmailingManagementOpen,
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
        numberOfAvailableWebhooks,
    };
};
