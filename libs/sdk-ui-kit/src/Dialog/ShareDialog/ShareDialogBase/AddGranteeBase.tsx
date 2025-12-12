// (C) 2021-2025 GoodData Corporation

import { useCallback } from "react";

import { useIntl } from "react-intl";

import { AddGranteeContent } from "./AddGranteeContent.js";
import { type IAddGranteeBaseProps } from "./types.js";
import { BackButton } from "../../BackButton.js";
import { ConfirmDialogBase } from "../../ConfirmDialogBase.js";
import { ContentDivider } from "../../ContentDivider.js";

/**
 * @internal
 */
export function AddGranteeBase({
    appliedGrantees,
    addedGrantees,
    currentUser,
    isDirty,
    currentUserPermissions,
    sharedObject,
    previouslyFocusedRef,
    onCancel,
    onSubmit,
    onBackClick,
    onAddUserOrGroups,
    onDelete,
    onGranularGranteeChange,
    isGranteeShareLoading,
}: IAddGranteeBaseProps) {
    const intl = useIntl();
    const {
        isLocked: isSharedObjectLocked,
        ref: sharedObjectRef,
        areGranularPermissionsSupported,
    } = sharedObject;

    const backButtonRenderer = useCallback(() => {
        return <BackButton onClick={onBackClick ?? (() => {})} className="s-share-dialog-navigate-back" />;
    }, [onBackClick]);

    return (
        <ConfirmDialogBase
            className="gd-share-dialog gd-share-dialog-add-users s-gd-share-add-grantees"
            displayCloseButton
            isPositive
            isSubmitDisabled={!isDirty}
            headline={intl.formatMessage({ id: "shareDialog.share.grantee.add.info" })}
            cancelButtonText={intl.formatMessage({ id: "cancel" })}
            submitButtonText={intl.formatMessage({ id: "shareDialog.share.grantee.share" })}
            submitOnEnterKey={false}
            shouldCloseOnEscape
            returnFocusTo={previouslyFocusedRef}
            onCancel={onBackClick}
            onSubmit={onSubmit}
            onClose={onCancel}
            headerLeftButtonRenderer={backButtonRenderer}
        >
            <AddGranteeContent
                currentUserPermissions={currentUserPermissions}
                isSharedObjectLocked={isSharedObjectLocked}
                currentUser={currentUser}
                addedGrantees={addedGrantees}
                appliedGrantees={appliedGrantees}
                areGranularPermissionsSupported={areGranularPermissionsSupported}
                sharedObjectRef={sharedObjectRef}
                onAddUserOrGroups={onAddUserOrGroups ?? (() => {})}
                onDelete={onDelete}
                onGranularGranteeChange={onGranularGranteeChange}
                isGranteeShareLoading={isGranteeShareLoading}
            />
            <ContentDivider />
        </ConfirmDialogBase>
    );
}
