// (C) 2022-2024 GoodData Corporation

import { useCallback, useState } from "react";
import { useToastMessage } from "@gooddata/sdk-ui-kit";
import { IAutomationMetadataObject, IWidget } from "@gooddata/sdk-model";

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
    uiActions,
    selectEntitlementMaxAutomations,
    selectWebhooks,
    selectSmtps,
    selectAutomationsCount,
    selectUsers,
    selectWebhooksIsLoading,
    selectAutomationsIsLoading,
    selectWebhooksError,
    selectAutomationsError,
    selectAutomationsSchedulesInContext,
    selectEntitlementUnlimitedAutomations,
} from "../store/index.js";
import { refreshAutomations } from "../commands/index.js";
import { messages } from "../../locales.js";

import { useDashboardDispatch, useDashboardSelector } from "./DashboardStoreProvider.js";

/**
 * @alpha
 * Default maximum number of automations.
 */
export const DEFAULT_MAX_AUTOMATIONS = "10";

/**
 * Hook that handles schedule emailing dialogs.
 *
 * @alpha
 */
export const useDashboardScheduledEmails = () => {
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

    const automationsCount = useDashboardSelector(selectAutomationsCount);
    const webhooks = useDashboardSelector(selectWebhooks);
    const emails = useDashboardSelector(selectSmtps);
    const users = useDashboardSelector(selectUsers);

    const automations = useDashboardSelector(selectAutomationsSchedulesInContext);
    const automationsLoading = useDashboardSelector(selectAutomationsIsLoading);
    const automationsError = useDashboardSelector(selectAutomationsError);

    const isScheduleLoading = [
        useDashboardSelector(selectWebhooksIsLoading),
        useDashboardSelector(selectAutomationsIsLoading),
        automationsLoading,
    ].some(Boolean);

    const schedulingLoadError = [
        useDashboardSelector(selectWebhooksError),
        useDashboardSelector(selectAutomationsError),
        automationsError,
    ].find(Boolean);

    const isReadOnly = useDashboardSelector(selectIsReadOnly);
    const isInViewMode = useDashboardSelector(selectIsInViewMode);
    const menuButtonItemsVisibility = useDashboardSelector(selectMenuButtonItemsVisibility);
    const isScheduledEmailingEnabled = useDashboardSelector(selectEnableScheduling);
    const canExport = useDashboardSelector(selectCanExportPdf);
    const isWorkspaceManager = useDashboardSelector(selectCanManageWorkspace);

    const maxAutomationsEntitlement = useDashboardSelector(selectEntitlementMaxAutomations);
    const unlimitedAutomationsEntitlement = useDashboardSelector(selectEntitlementUnlimitedAutomations);
    const maxAutomations = parseInt(maxAutomationsEntitlement?.value ?? DEFAULT_MAX_AUTOMATIONS, 10);

    const numberOfAvailableDestinations = webhooks.length + emails.length;
    const maxAutomationsReached = automationsCount >= maxAutomations && !unlimitedAutomationsEntitlement;

    /**
     * We want to hide scheduling when there are no webhooks unless the user is admin.
     */
    const showDueToNumberOfAvailableDestinations = numberOfAvailableDestinations > 0 || isWorkspaceManager;

    const isSchedulingAvailable =
        isInViewMode &&
        !isReadOnly &&
        isScheduledEmailingEnabled &&
        canExport &&
        showDueToNumberOfAvailableDestinations &&
        (menuButtonItemsVisibility.scheduleEmailButton ?? true);

    const isScheduledEmailingVisible = isSchedulingAvailable && !maxAutomationsReached;
    const isScheduledManagementEmailingVisible = isSchedulingAvailable && automations.length > 0;

    const openScheduleEmailingDialog = useCallback(
        (widget?: IWidget) =>
            isScheduledEmailingEnabled &&
            dispatch(
                uiActions.openScheduleEmailDialog({
                    ...(widget?.ref ? { widgetRef: widget.ref } : {}),
                }),
            ),
        [dispatch, isScheduledEmailingEnabled],
    );
    const closeScheduleEmailingDialog = useCallback(
        () => isScheduledEmailingEnabled && dispatch(uiActions.closeScheduleEmailDialog()),
        [dispatch, isScheduledEmailingEnabled],
    );
    const openScheduleEmailingManagementDialog = useCallback(
        (widget?: IWidget) =>
            isScheduledEmailingEnabled &&
            dispatch(
                uiActions.openScheduleEmailManagementDialog({
                    ...(widget?.ref ? { widgetRef: widget.ref } : {}),
                }),
            ),
        [dispatch, isScheduledEmailingEnabled],
    );
    const closeScheduleEmailingManagementDialog = useCallback(
        () => isScheduledEmailingEnabled && dispatch(uiActions.closeScheduleEmailManagementDialog()),
        [dispatch, isScheduledEmailingEnabled],
    );

    const [scheduledEmailToEdit, setScheduledEmailToEdit] = useState<IAutomationMetadataObject>();

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
            dispatch(refreshAutomations());
        },
        [closeScheduleEmailingDialog, openScheduleEmailingManagementDialog, addSuccess, dispatch],
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
            dispatch(refreshAutomations());
        },
        [
            closeScheduleEmailingDialog,
            openScheduleEmailingManagementDialog,
            addSuccess,
            setScheduledEmailToEdit,
            dispatch,
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
        dispatch(refreshAutomations());
    }, [addSuccess, closeScheduleEmailingDialog, dispatch]);

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
        webhooks,
        emails,
        users,
        automations,
        automationsCount,
        schedulingLoadError,
        numberOfAvailableDestinations,
        isScheduleLoading,
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
    };
};
