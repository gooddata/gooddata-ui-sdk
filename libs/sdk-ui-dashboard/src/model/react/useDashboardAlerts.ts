// (C) 2022-2024 GoodData Corporation

import { useDashboardDispatch, useDashboardSelector } from "./DashboardStoreProvider.js";
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
    selectSettings,
    selectCurrentUser,
    selectAutomationsFingerprint,
    selectWebhooksError,
    selectAutomationsError,
} from "../store/index.js";
import { useCallback, useState } from "react";
import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { useToastMessage } from "@gooddata/sdk-ui-kit";
import { messages } from "../../locales.js";
import {
    GoodDataSdkError,
    useBackendStrict,
    useCancelablePromise,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";
import { loadContextAutomations } from "../commandHandlers/dashboard/common/loadWorkspaceAutomations.js";
import { getAuthor } from "../utils/author.js";
import { refreshAutomations } from "../commands/index.js";

/**
 * Hook that handles alerts dialog
 *
 * @alpha
 */
export const useDashboardAlerts = ({ dashboard }: { dashboard?: string }) => {
    const { addSuccess, addError } = useToastMessage();

    const isAlertingDialogOpen = useDashboardSelector(selectIsAlertingDialogOpen) || false;
    const isAlertingManagementDialogOpen = useDashboardSelector(selectIsAlertsManagementDialogOpen) || false;

    const [alertingToEdit, setAlertingToEdit] = useState<IAutomationMetadataObject>();

    const isReadOnly = useDashboardSelector(selectIsReadOnly);
    const isInViewMode = useDashboardSelector(selectIsInViewMode);
    const isAlertingEnabled = useDashboardSelector(selectEnableAlerting);
    const menuButtonItemsVisibility = useDashboardSelector(selectMenuButtonItemsVisibility);
    const isWorkspaceManager = useDashboardSelector(selectCanManageWorkspace);

    const dispatch = useDashboardDispatch();
    const dashboardRef = useDashboardSelector(selectDashboardRef);

    const webhooks = useDashboardSelector(selectWebhooks);
    const numberOfAvailableWebhooks = webhooks.length;

    const { automations, automationsLoading, automationsError } = useContextAutomations({
        dashboardId: dashboard,
    });

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
    const showDueToNumberOfAvailableWebhooks = numberOfAvailableWebhooks > 0 || isWorkspaceManager;

    const isAlertingAvailable =
        isInViewMode &&
        !isReadOnly &&
        showDueToNumberOfAvailableWebhooks &&
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
        (alert: IAutomationMetadataObject) => {
            closeAlertingManagementDialog();
            setAlertingToEdit(alert);
            openAlertingDialog();
        },
        [closeAlertingManagementDialog, openAlertingDialog],
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

    const onAlertingSaveError = useCallback(() => {
        closeAlertingDialog();
        addError(messages.alertingSaveError);
        setAlertingToEdit(undefined);
    }, [addError, setAlertingToEdit, closeAlertingDialog]);

    const onAlertingSaveSuccess = useCallback(() => {
        closeAlertingDialog();
        openAlertingManagementDialog();
        addSuccess(messages.alertingSaveSuccess);
        setAlertingToEdit(undefined);
        dispatch(refreshAutomations());
    }, [addSuccess, closeAlertingDialog, openAlertingManagementDialog, dispatch]);

    const onAlertingCancel = useCallback(() => {
        closeAlertingDialog();
        setAlertingToEdit(undefined);
        openAlertingManagementDialog();
    }, [openAlertingManagementDialog, closeAlertingDialog, setAlertingToEdit]);

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
        onAlertingSaveError,
        onAlertingSaveSuccess,
        onAlertingCancel,
    };
};

function useContextAutomations(opts: { dashboardId?: string }) {
    const settings = useDashboardSelector(selectSettings);
    const user = useDashboardSelector(selectCurrentUser);
    const fingerprint = useDashboardSelector(selectAutomationsFingerprint);

    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    const { result, status, error } = useCancelablePromise(
        {
            promise: async () => {
                return loadContextAutomations(backend, workspace, settings, {
                    author: getAuthor(backend.capabilities, user),
                    dashboardId: opts.dashboardId,
                });
            },
        },
        [opts.dashboardId, backend, workspace, settings, user, fingerprint],
    );

    return {
        automations: [
            ...(result ?? []).filter((automation) => automation.alert),
            {
                id: "automation-1",
                alert: {
                    execution: {},
                    condition: {
                        operator: "LESS_THAN",
                        left: {
                            measure: {
                                title: "# Amount",
                            },
                        },
                        right: 100,
                    },
                    trigger: {
                        mode: "ONCE",
                        state: "ACTIVE",
                    },
                },
                exportDefinitions: [
                    {
                        requestPayload: {
                            type: "visualizationObject",
                            fileName: "",
                            format: "PDF",
                            content: {
                                visualizationObject: "",
                                widget: "64b0678a-cc32-4c9e-8a43-893c70d006da",
                            },
                        },
                    },
                ],
                details: {},
                dashboard: "dashboard/03019990-2e1e-4f29-a7b5-d91082975bf8",
            },
        ] as IAutomationMetadataObject[],
        automationsLoading: status === "loading",
        automationsError: error,
    };
}
