// (C) 2020-2022 GoodData Corporation
import React, { useCallback } from "react";
import { useToastMessage } from "@gooddata/sdk-ui-kit";
import {
    useDashboardSelector,
    selectIsShareDialogOpen,
    useDashboardDispatch,
    uiActions,
    selectPersistedDashboard,
    selectCurrentUserRef,
    useDashboardCommandProcessing,
    changeSharing,
    selectCanManageWorkspace,
    selectDashboardPermissions,
} from "../../../model";
import { ShareDialog, ISharingApplyPayload } from "../../shareDialog";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { messages } from "../../../locales";

const useShareDialogDashboardHeader = () => {
    const dispatch = useDashboardDispatch();
    const { addSuccess, addError } = useToastMessage();
    const isShareDialogOpen = useDashboardSelector(selectIsShareDialogOpen);
    const persistedDashboard = useDashboardSelector(selectPersistedDashboard);
    const currentUserRef = useDashboardSelector(selectCurrentUserRef);
    const isLockingSupported = useDashboardSelector(selectCanManageWorkspace);
    const dashboardPermissions = useDashboardSelector(selectDashboardPermissions);
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    const { run: runChangeSharing } = useDashboardCommandProcessing({
        commandCreator: changeSharing,
        successEvent: "GDC.DASH/EVT.SHARING.CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onSuccess: () => {
            addSuccess(messages.messagesSharingChangedSuccess);
        },
        onError: () => {
            addError(messages.messagesSharingChangedError);
        },
    });

    const closeShareDialog = useCallback(() => dispatch(uiActions.closeShareDialog()), [dispatch]);

    const onCloseShareDialog = useCallback(() => {
        closeShareDialog();
    }, [closeShareDialog]);

    const onApplyShareDialog = useCallback(
        (payload: ISharingApplyPayload) => {
            closeShareDialog();
            runChangeSharing(payload);
        },
        [closeShareDialog, runChangeSharing],
    );

    const onErrorShareDialog = useCallback(() => {
        dispatch(uiActions.closeShareDialog());
        addError(messages.messagesSharingDialogError);
    }, [dispatch, addError]);

    return {
        backend,
        workspace,
        isShareDialogOpen,
        persistedDashboard,
        currentUserRef,
        dashboardPermissions,
        isLockingSupported,
        onCloseShareDialog,
        onApplyShareDialog,
        onErrorShareDialog,
    };
};

/**
 * @internal
 */
export const ShareDialogDashboardHeader = (): JSX.Element | null => {
    const {
        backend,
        workspace,
        isShareDialogOpen,
        persistedDashboard,
        currentUserRef,
        isLockingSupported,
        dashboardPermissions,
        onCloseShareDialog,
        onApplyShareDialog,
        onErrorShareDialog,
    } = useShareDialogDashboardHeader();

    if (!isShareDialogOpen) {
        return null;
    }

    return (
        <ShareDialog
            backend={backend}
            workspace={workspace}
            isVisible={isShareDialogOpen}
            currentUserRef={currentUserRef}
            sharedObject={persistedDashboard!}
            dashboardPermissions={dashboardPermissions}
            onCancel={onCloseShareDialog}
            onApply={onApplyShareDialog}
            onError={onErrorShareDialog}
            isLockingSupported={isLockingSupported}
        />
    );
};
