// (C) 2020-2026 GoodData Corporation

import { type ReactElement, useMemo } from "react";

import { useIntl } from "react-intl";

import { type IShareDialogLabels, ShareDialog } from "@gooddata/sdk-ui-kit";

import { type IShareDialogProps } from "./types.js";
import { useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { selectLocale } from "../../model/store/config/configSelectors.js";

/**
 * @alpha
 */
export function DefaultShareDialog({
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
}: IShareDialogProps): ReactElement | null {
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
