// (C) 2020 GoodData Corporation
import React, { useCallback, useMemo } from "react";
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
} from "../../../model";
import { ShareDialog, ISharingApplyPayload } from "../../shareDialog";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

const useShareDialogDashboardHeader = () => {
    const dispatch = useDashboardDispatch();
    const { addSuccess, addError } = useToastMessage();
    const isShareDialogOpen = useDashboardSelector(selectIsShareDialogOpen);
    const persistedDashboard = useDashboardSelector(selectPersistedDashboard);
    const currentUserRef = useDashboardSelector(selectCurrentUserRef);
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    const closeShareDialog = useMemo(() => {
        return () => dispatch(uiActions.closeShareDialog());
    }, [dispatch, uiActions]);

    const { run: runChangeSharing } = useDashboardCommandProcessing({
        commandCreator: changeSharing,
        successEvent: "GDC.DASH/EVT.SHARING.CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onSuccess: () => {
            addSuccess({ id: "messages.sharingChangedSuccess" });
        },
        onError: () => {
            addError({ id: "messages.sharingChangedError.general" });
        },
    });

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
        addError({ id: "messages.sharingDialogError.general" });
    }, [dispatch, addError, uiActions]);

    return {
        backend,
        workspace,
        isShareDialogOpen,
        persistedDashboard,
        currentUserRef,
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
            onCancel={onCloseShareDialog}
            onApply={onApplyShareDialog}
            onError={onErrorShareDialog}
        />
    );
};
