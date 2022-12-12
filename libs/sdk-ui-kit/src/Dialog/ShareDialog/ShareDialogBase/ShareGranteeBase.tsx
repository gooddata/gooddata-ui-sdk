// (C) 2021-2022 GoodData Corporation
import React, { useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { ConfirmDialogBase } from "../../ConfirmDialogBase";
import { Message } from "../../../Messages";

import { ContentDivider } from "./ContentDivider";
import { ShareGranteeContent } from "./ShareGranteeContent";
import { IShareGranteeBaseProps } from "./types";
import { useShareGranteeBaseState } from "./useShareGranteeBase";

import { SharedObjectUnderLenientControl } from "./SharedObjectUnderLenientControl";
import { SharedObjectLockControl } from "./SharedObjectLockControl";

/**
 * @internal
 */
export const ShareGranteeBase: React.FC<IShareGranteeBaseProps> = (props) => {
    const {
        isLoading,
        isLockedNow,
        isUnderLenientControlNow,
        grantees,
        sharedObject,
        isDirty,
        onCancel,
        onSubmit,
        onGranteeDelete,
        onGranularGranteeChange,
        onAddGranteeButtonClick,
        onLockChange,
        onUnderLenientControlChange,
    } = props;
    const {
        owner,
        isLeniencyControlSupported,
        isLockingSupported,
        areGranularPermissionsSupported,
        canWorkspaceAdminSeeEveryDashboard,
    } = sharedObject;

    const { messageVisibility, handleLocalStorageClose } = useShareGranteeBaseState(props);

    const intl = useIntl();

    const granteeList = useMemo(() => {
        return [owner, ...grantees];
    }, [grantees, owner, intl]);

    const dialogLabels = useMemo(() => {
        return {
            headline: intl.formatMessage({ id: "shareDialog.share.grantee.title" }),
            cancelButtonText: intl.formatMessage({ id: "cancel" }),
            submitButtonText: intl.formatMessage({ id: "save" }),
        };
    }, []);

    const shouldDisplayAdminMessage = canWorkspaceAdminSeeEveryDashboard && messageVisibility;

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
                isLoading={isLoading}
                grantees={granteeList}
                areGranularPermissionsSupported={areGranularPermissionsSupported}
                onAddGrantee={onAddGranteeButtonClick}
                onDelete={onGranteeDelete}
                onChange={onGranularGranteeChange}
            />
            <ContentDivider />
            {shouldDisplayAdminMessage && (
                <Message
                    type="progress"
                    className="gd-granular-permissions-admin-information"
                    onClose={handleLocalStorageClose}
                >
                    <span>
                        <FormattedMessage
                            id="shareDialog.share.granular.administrator.info"
                            values={{ b: (chunks: string) => <strong>{chunks}</strong> }}
                        />
                    </span>
                </Message>
            )}
            <SharedObjectUnderLenientControl
                isUnderLenientControl={isUnderLenientControlNow}
                isLeniencyControlSupported={isLeniencyControlSupported}
                onUnderLenientControlChange={onUnderLenientControlChange}
            />
            <SharedObjectLockControl
                isLocked={isLockedNow}
                isLockingSupported={isLockingSupported}
                onLockChange={onLockChange}
            />
        </ConfirmDialogBase>
    );
};
