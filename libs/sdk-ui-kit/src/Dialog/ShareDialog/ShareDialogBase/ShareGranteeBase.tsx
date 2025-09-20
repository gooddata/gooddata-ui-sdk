// (C) 2021-2025 GoodData Corporation

import { useMemo } from "react";

import { compact } from "lodash-es";
import { useIntl } from "react-intl";

import { AdminInformationMessage } from "./AdminInformationMessage.js";
import { SharedObjectLockControl } from "./SharedObjectLockControl.js";
import { SharedObjectUnderLenientControl } from "./SharedObjectUnderLenientControl.js";
import { ShareGranteeContent } from "./ShareGranteeContent.js";
import { ShareLink } from "./ShareLink.js";
import { IShareGranteeBaseProps } from "./types.js";
import { ADD_GRANTEE_ID } from "./utils.js";
import { ConfirmDialogBase } from "../../ConfirmDialogBase.js";
import { ContentDivider } from "../../ContentDivider.js";

/**
 * @internal
 */
export function ShareGranteeBase(props: IShareGranteeBaseProps) {
    const {
        isLoading,
        isLockedNow,
        isUnderLenientControlNow,
        grantees,
        sharedObject,
        isDirty,
        currentUserPermissions,
        dashboardFilters,
        isShareGrantHidden,
        applyShareGrantOnSelect,
        showDashboardShareLink,
        isGranteeShareLoading,
        onCancel,
        onSubmit,
        onGranteeDelete,
        onGranularGranteeChange,
        onAddGranteeButtonClick,
        onLockChange,
        onUnderLenientControlChange,
        isCurrentUserWorkspaceManager,
        onShareLinkCopy,
    } = props;
    const {
        owner,
        isLeniencyControlSupported,
        isLockingSupported,
        areGranularPermissionsSupported,
        isMetadataObjectLockingSupported,
        isLocked,
        canWorkspaceManagerSeeEverySharedObject,
    } = sharedObject;
    const intl = useIntl();

    const granteeList = useMemo(() => {
        return compact([owner, ...grantees]);
    }, [grantees, owner]);

    const dialogLabels = useMemo(() => {
        const shareDashboardTitle = intl.formatMessage({ id: "shareDialog.share.dashboard.title" });
        const shareGranteeTitle = intl.formatMessage({ id: "shareDialog.share.grantee.title" });
        const shareDashboardListTitle = intl.formatMessage({ id: "shareDialog.share.dashboard.list.title" });
        const shareGranteeListTitle = intl.formatMessage({ id: "shareDialog.share.grantee.list.title" });
        const cancelButtonText = intl.formatMessage({ id: "cancel" });
        const closeButtonText = intl.formatMessage({ id: "close" });
        return {
            headline: showDashboardShareLink ? shareDashboardTitle : shareGranteeTitle,
            shareGrantHeadline: showDashboardShareLink ? shareDashboardListTitle : shareGranteeListTitle,
            cancelButtonText: applyShareGrantOnSelect ? closeButtonText : cancelButtonText,
            linkHeadline: intl.formatMessage({ id: "shareDialog.share.link.title" }),
            linkHelperText: intl.formatMessage({ id: "shareDialog.share.link.helperText" }),
            linkButtonLabel: intl.formatMessage({ id: "shareDialog.share.link.buttonText" }),
            submitButtonText: intl.formatMessage({ id: "save" }),
        };
    }, [intl, showDashboardShareLink, applyShareGrantOnSelect]);

    const shouldDisplayAdminMessage = useMemo(
        () => canWorkspaceManagerSeeEverySharedObject && isCurrentUserWorkspaceManager && !isLoading,
        [canWorkspaceManagerSeeEverySharedObject, isCurrentUserWorkspaceManager, isLoading],
    );

    return (
        <ConfirmDialogBase
            className="gd-share-dialog s-gd-share-grantees"
            displayCloseButton={true}
            isPositive={true}
            isSubmitDisabled={!isDirty}
            headline={dialogLabels.headline}
            cancelButtonText={dialogLabels.cancelButtonText}
            submitButtonText={dialogLabels.submitButtonText}
            onCancel={onCancel}
            onSubmit={onSubmit}
            hideSubmitButton={applyShareGrantOnSelect}
            initialFocus={ADD_GRANTEE_ID}
        >
            <AdminInformationMessage isVisible={shouldDisplayAdminMessage} />
            {isShareGrantHidden ? null : (
                <ShareGranteeContent
                    currentUserPermissions={currentUserPermissions}
                    isSharedObjectLocked={isLocked}
                    isLoading={isLoading}
                    grantees={granteeList}
                    areGranularPermissionsSupported={areGranularPermissionsSupported}
                    onAddGrantee={onAddGranteeButtonClick}
                    onDelete={onGranteeDelete}
                    onChange={onGranularGranteeChange}
                    isGranteeShareLoading={isGranteeShareLoading}
                    applyShareGrantOnSelect={applyShareGrantOnSelect}
                    headline={dialogLabels.shareGrantHeadline}
                />
            )}

            {showDashboardShareLink ? (
                <ShareLink
                    dashboardFilters={dashboardFilters}
                    onShareLinkCopy={onShareLinkCopy}
                    headline={dialogLabels.linkHeadline}
                    helperText={dialogLabels.linkHelperText}
                    buttonLabel={dialogLabels.linkButtonLabel}
                />
            ) : null}

            <ContentDivider className="gd-share-dialog-content-divider" />
            <SharedObjectUnderLenientControl
                isUnderLenientControl={isUnderLenientControlNow}
                isLeniencyControlSupported={isLeniencyControlSupported}
                onUnderLenientControlChange={onUnderLenientControlChange}
            />
            {isMetadataObjectLockingSupported ? (
                <SharedObjectLockControl
                    isLocked={isLockedNow}
                    isLockingSupported={isLockingSupported}
                    onLockChange={onLockChange}
                />
            ) : null}
        </ConfirmDialogBase>
    );
}
