// (C) 2022-2024 GoodData Corporation

import { useCallback, useState } from "react";
import { IAutomationMetadataObject, IInsightWidget } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import {
    uiActions,
    selectCanManageWorkspace,
    selectDashboardRef,
    selectIsInViewMode,
    selectIsReadOnly,
    selectMenuButtonItemsVisibility,
    selectWebhooks,
    selectIsAlertingDialogOpen,
    selectIsAlertsManagementDialogOpen,
    selectEnableAlerting,
    selectWebhooksIsLoading,
    selectAutomationsIsLoading,
    selectWebhooksError,
    selectAutomationsError,
    selectAutomationsAlertsInContext,
    selectSmtps,
} from "../store/index.js";
import { messages } from "../../locales.js";
import { refreshAutomations } from "../commands/index.js";

import { useDashboardDispatch, useDashboardSelector } from "./DashboardStoreProvider.js";

/**
 * Hook that handles alerts dialog
 *
 * @alpha
 */
export const useDashboardAlerts = () => {
    const { addSuccess, addError } = useToastMessage();

    const isAlertingDialogOpen = useDashboardSelector(selectIsAlertingDialogOpen) || false;
    const isAlertingManagementDialogOpen = useDashboardSelector(selectIsAlertsManagementDialogOpen) || false;

    const [alertingToEdit, setAlertingToEdit] = useState<{
        alert: IAutomationMetadataObject;
        widget: IInsightWidget | undefined;
        anchor: HTMLElement | null;
    } | null>(null);
    const [onEditAlertingClosed, setOnEditAlertingClosed] = useState<{ handler: (() => void) | null }>({
        handler: null,
    });

    const isReadOnly = useDashboardSelector(selectIsReadOnly);
    const isInViewMode = useDashboardSelector(selectIsInViewMode);
    const isAlertingEnabled = useDashboardSelector(selectEnableAlerting);
    const menuButtonItemsVisibility = useDashboardSelector(selectMenuButtonItemsVisibility);
    const isWorkspaceManager = useDashboardSelector(selectCanManageWorkspace);

    const dispatch = useDashboardDispatch();
    const dashboardRef = useDashboardSelector(selectDashboardRef);

    const webhooks = useDashboardSelector(selectWebhooks);
    const emails = useDashboardSelector(selectSmtps);

    const numberOfAvailableDestinations = webhooks.length + emails.length;

    const automations = useDashboardSelector(selectAutomationsAlertsInContext(undefined));
    const automationsLoading = useDashboardSelector(selectAutomationsIsLoading);
    const automationsError = useDashboardSelector(selectAutomationsError);

    const isAlertingLoading = [
        useDashboardSelector(selectWebhooksIsLoading),
        useDashboardSelector(selectAutomationsIsLoading),
        automationsLoading,
    ].some(Boolean);

    const alertingLoadError = [
        useDashboardSelector(selectWebhooksError),
        useDashboardSelector(selectAutomationsError),
        automationsError,
    ].find(Boolean);

    /**
     * We want to hide scheduling when there are no webhooks unless the user is admin.
     */
    const showDueToNumberOfAvailableDestinations = numberOfAvailableDestinations > 0 || isWorkspaceManager;

    const isAlertingAvailable =
        isInViewMode &&
        !isReadOnly &&
        showDueToNumberOfAvailableDestinations &&
        (menuButtonItemsVisibility.alertingButton ?? true);
    const isAlertsManagementVisible = isAlertingAvailable && isAlertingEnabled;

    const openAlertingManagementDialog = useCallback(
        () => isAlertingEnabled && dispatch(uiActions.openAlertingManagementDialog()),
        [dispatch, isAlertingEnabled],
    );

    const closeAlertingManagementDialog = useCallback(
        () => isAlertingEnabled && dispatch(uiActions.closeAlertingManagementDialog()),
        [dispatch, isAlertingEnabled],
    );

    const openAlertingDialog = useCallback(
        () => isAlertingEnabled && dispatch(uiActions.openAlertingDialog()),
        [dispatch, isAlertingEnabled],
    );
    const closeAlertingDialog = useCallback(
        () => isAlertingEnabled && dispatch(uiActions.closeAlertingDialog()),
        [dispatch, isAlertingEnabled],
    );

    const defaultOnAlerting = useCallback(() => {
        if (!dashboardRef) {
            return;
        }

        openAlertingDialog();
    }, [dashboardRef, openAlertingDialog]);

    const defaultOnAlertsManagement = useCallback(() => {
        if (!dashboardRef) {
            return;
        }

        openAlertingManagementDialog();
    }, [dashboardRef, openAlertingManagementDialog]);

    const onAlertingManagementEdit = useCallback(
        (
            alert: IAutomationMetadataObject,
            widget: IInsightWidget | undefined,
            anchor: HTMLElement | null,
            onClosed: () => void,
        ) => {
            setAlertingToEdit({
                alert,
                anchor,
                widget,
            });
            setOnEditAlertingClosed({ handler: onClosed });
            openAlertingDialog();
        },
        [openAlertingDialog],
    );

    const onAlertingManagementClose = useCallback(() => {
        closeAlertingManagementDialog();
    }, [closeAlertingManagementDialog]);

    const onAlertingManagementLoadingError = useCallback(() => {
        closeAlertingManagementDialog();
        addError(messages.alertingManagementLoadError);
    }, [closeAlertingManagementDialog, addError]);

    const onAlertingManagementDeleteSuccess = useCallback(() => {
        closeAlertingDialog();
        addSuccess(messages.alertingDeleteSuccess);
        dispatch(refreshAutomations());
    }, [addSuccess, closeAlertingDialog, dispatch]);

    const onAlertingManagementDeleteError = useCallback(() => {
        closeAlertingDialog();
        addError(messages.alertingManagementDeleteError);
    }, [closeAlertingDialog, addError]);

    const onAlertingManagementPauseSuccess = useCallback(
        (_alert: IAutomationMetadataObject, pause: boolean) => {
            closeAlertingDialog();
            if (pause) {
                addSuccess(messages.alertingManagementPauseSuccess);
            } else {
                addSuccess(messages.alertingManagementActivateSuccess);
            }
            dispatch(refreshAutomations());
        },
        [addSuccess, closeAlertingDialog, dispatch],
    );

    const onAlertingManagementPauseError = useCallback(
        (_err: GoodDataSdkError, pause: boolean) => {
            closeAlertingDialog();
            if (pause) {
                addError(messages.alertingManagementPauseError);
            } else {
                addError(messages.alertingManagementActivateError);
            }
        },
        [closeAlertingDialog, addError],
    );

    const onAlertingUpdate = useCallback(
        (_alert: IAutomationMetadataObject) => {
            closeAlertingDialog();
            setAlertingToEdit(null);
            dispatch(refreshAutomations());
        },
        [closeAlertingDialog, dispatch],
    );

    const onAlertingCancel = useCallback(() => {
        closeAlertingDialog();
        onEditAlertingClosed.handler?.();
        setAlertingToEdit(null);
        setOnEditAlertingClosed({ handler: null });
    }, [closeAlertingDialog, onEditAlertingClosed]);

    return {
        webhooks,
        automations,
        alertingLoadError,
        alertingToEdit,
        defaultOnAlerting,
        defaultOnAlertsManagement,
        isAlertingLoading,
        isAlertsManagementVisible,
        isAlertingDialogOpen,
        isAlertingManagementDialogOpen,
        onAlertingManagementEdit,
        onAlertingManagementClose,
        onAlertingManagementDeleteSuccess,
        onAlertingManagementDeleteError,
        onAlertingManagementLoadingError,
        onAlertingManagementPauseSuccess,
        onAlertingManagementPauseError,
        onAlertingCancel,
        onAlertingUpdate,
    };
};
