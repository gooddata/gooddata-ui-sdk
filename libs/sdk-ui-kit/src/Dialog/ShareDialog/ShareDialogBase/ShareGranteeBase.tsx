// (C) 2021-2023 GoodData Corporation
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import compact from "lodash/compact.js";

import { ConfirmDialogBase } from "../../ConfirmDialogBase.js";

import { ContentDivider } from "./ContentDivider.js";
import { ShareGranteeContent } from "./ShareGranteeContent.js";
import { IShareGranteeBaseProps } from "./types.js";
import { SharedObjectUnderLenientControl } from "./SharedObjectUnderLenientControl.js";
import { SharedObjectLockControl } from "./SharedObjectLockControl.js";
import { useAdminInformationMessageState } from "./useAdminInformationMessage.js";
import { AdminInformationMessage } from "./AdminInformationMessage.js";

/**
 * @internal
 */
export const ShareGranteeBase: React.FC<IShareGranteeBaseProps> = (props) => {
    const {
        currentUser,
        isLoading,
        isLockedNow,
        isUnderLenientControlNow,
        grantees,
        sharedObject,
        isDirty,
        currentUserPermissions,
        onCancel,
        onSubmit,
        onGranteeDelete,
        onGranularGranteeChange,
        onAddGranteeButtonClick,
        onLockChange,
        onUnderLenientControlChange,
        isCurrentUserWorkspaceManager,
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
    const { isMessageVisible, handleMessageClose } = useAdminInformationMessageState(currentUser.ref);

    const granteeList = useMemo(() => {
        return compact([owner, ...grantees]);
    }, [grantees, owner]);

    const dialogLabels = useMemo(() => {
        return {
            headline: intl.formatMessage({ id: "shareDialog.share.grantee.title" }),
            cancelButtonText: intl.formatMessage({ id: "cancel" }),
            submitButtonText: intl.formatMessage({ id: "save" }),
        };
    }, [intl]);

    const shouldDisplayAdminMessage = useMemo(
        () =>
            canWorkspaceManagerSeeEverySharedObject &&
            isCurrentUserWorkspaceManager &&
            !isLoading &&
            isMessageVisible,
        [canWorkspaceManagerSeeEverySharedObject, isCurrentUserWorkspaceManager, isLoading, isMessageVisible],
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
        >
            <ShareGranteeContent
                currentUserPermissions={currentUserPermissions}
                isSharedObjectLocked={isLocked}
                isLoading={isLoading}
                grantees={granteeList}
                areGranularPermissionsSupported={areGranularPermissionsSupported}
                onAddGrantee={onAddGranteeButtonClick}
                onDelete={onGranteeDelete}
                onChange={onGranularGranteeChange}
            />
            <ContentDivider />
            <AdminInformationMessage isVisible={shouldDisplayAdminMessage} onClose={handleMessageClose} />
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
};
