// (C) 2020-2023 GoodData Corporation
import React, { useMemo } from "react";
import { ShareDialog, IShareDialogLabels } from "@gooddata/sdk-ui-kit";
import { IShareDialogProps } from "./types.js";
import { useIntl } from "react-intl";
import { useDashboardSelector, selectLocale } from "../../model/index.js";

/**
 * @alpha
 */
export const DefaultShareDialog = (props: IShareDialogProps): JSX.Element | null => {
    const {
        workspace,
        backend,
        isVisible,
        sharedObject,
        currentUser,
        isLockingSupported,
        isCurrentUserWorkspaceManager,
        currentUserPermissions,
        onApply,
        onCancel,
        onError,
        onInteraction,
    } = props;

    const locale = useDashboardSelector(selectLocale);
    const intl = useIntl();
    const labels: IShareDialogLabels = useMemo(
        () => ({
            accessTypeLabel: intl.formatMessage({ id: "dashboard.shareDialog.lock.label" }),
            accessRegimeLabel: intl.formatMessage({
                id: "dashboard.shareDialog.underLenientControl.label",
            }),
            removeAccessCreatorTooltip: intl.formatMessage({
                id: "dashboard.shareDialog.removeAccessCreatorTooltip",
            }),
            removeAccessGranteeTooltip: intl.formatMessage({
                id: "dashboard.shareDialog.removeAccessGranteeTooltip",
            }),
        }),
        [intl],
    );

    if (!isVisible) {
        return null;
    }

    return (
        <ShareDialog
            locale={locale}
            backend={backend}
            workspace={workspace}
            sharedObject={sharedObject}
            currentUser={currentUser}
            onApply={onApply}
            onCancel={onCancel}
            onError={onError}
            isLockingSupported={isLockingSupported}
            labels={labels}
            isCurrentUserWorkspaceManager={isCurrentUserWorkspaceManager}
            currentUserPermissions={currentUserPermissions}
            onInteraction={onInteraction}
        />
    );
};
