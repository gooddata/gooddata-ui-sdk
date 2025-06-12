// (C) 2020-2025 GoodData Corporation
import React, { useCallback } from "react";
import { useToastMessage } from "@gooddata/sdk-ui-kit";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { messages } from "../../../locales.js";
import {
    useDashboardSelector,
    useDashboardDispatch,
    selectIsSettingsDialogOpen,
    uiActions,
    metaActions,
} from "../../../model/index.js";
import {
    DashboardSettingsDialog,
    IDashboardSettingsApplyPayload,
} from "../../dashboardSettingsDialog/index.js";

const useShareDialogDashboardHeader = () => {
    const dispatch = useDashboardDispatch();
    const { addError } = useToastMessage();
    const isSettingsDialogOpen = useDashboardSelector(selectIsSettingsDialogOpen);
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    const closeSettingsDialog = useCallback(() => dispatch(uiActions.closeSettingsDialog()), [dispatch]);

    const onCloseSettingsDialog = useCallback(() => {
        closeSettingsDialog();
    }, [closeSettingsDialog]);

    const onApplySettingsDialog = useCallback(
        (payload: IDashboardSettingsApplyPayload) => {
            closeSettingsDialog();

            dispatch(metaActions.setDisableCrossFiltering(payload.disableCrossFiltering));
            dispatch(metaActions.setDisableUserFilterReset(payload.disableUserFilterReset));
            dispatch(metaActions.setDisableFilterViews(payload.disableFilterViews));
            dispatch(metaActions.setDisableUserFilterSave(payload.disableUserFilterSave));
            dispatch(metaActions.setEvaluationFrequency(payload.evaluationFrequency));
        },
        [closeSettingsDialog, dispatch],
    );

    const onErrorSettingsDialog = useCallback(() => {
        dispatch(uiActions.closeSettingsDialog());
        addError(messages.messagesSharingDialogError);
    }, [dispatch, addError]);

    return {
        backend,
        workspace,
        isSettingsDialogOpen,
        onCloseSettingsDialog,
        onApplySettingsDialog,
        onErrorSettingsDialog,
    };
};

/**
 * @internal
 */
export const SettingsDialogProvider = (): JSX.Element | null => {
    const {
        backend,
        workspace,
        isSettingsDialogOpen,
        onCloseSettingsDialog,
        onApplySettingsDialog,
        onErrorSettingsDialog,
    } = useShareDialogDashboardHeader();

    if (!isSettingsDialogOpen) {
        return null;
    }

    return (
        <DashboardSettingsDialog
            backend={backend}
            workspace={workspace}
            isVisible={isSettingsDialogOpen}
            onCancel={onCloseSettingsDialog}
            onApply={onApplySettingsDialog}
            onError={onErrorSettingsDialog}
        />
    );
};
