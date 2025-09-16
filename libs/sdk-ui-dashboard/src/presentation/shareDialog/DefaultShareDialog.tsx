// (C) 2020-2025 GoodData Corporation

import { ReactElement, useMemo } from "react";

import { useIntl } from "react-intl";

import { IShareDialogLabels, ShareDialog } from "@gooddata/sdk-ui-kit";

import { IShareDialogProps } from "./types.js";
import { selectLocale, useDashboardSelector } from "../../model/index.js";

/**
 * @alpha
 */
export function DefaultShareDialog(props: IShareDialogProps): ReactElement | null {
    const {
        workspace,
        backend,
        isVisible,
        sharedObject,
        currentUser,
        isLockingSupported,
        isCurrentUserWorkspaceManager,
        currentUserPermissions,
        dashboardFilters,
        isShareGrantHidden,
        applyShareGrantOnSelect,
        showDashboardShareLink,
        isGranteeShareLoading,
        onApply,
        onCancel,
        onError,
        onInteraction,
        onShareLinkCopy,
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
            dashboardFilters={dashboardFilters}
            isShareGrantHidden={isShareGrantHidden}
            applyShareGrantOnSelect={applyShareGrantOnSelect}
            showDashboardShareLink={showDashboardShareLink}
            isGranteeShareLoading={isGranteeShareLoading}
            onInteraction={onInteraction}
            onShareLinkCopy={onShareLinkCopy}
        />
    );
}
