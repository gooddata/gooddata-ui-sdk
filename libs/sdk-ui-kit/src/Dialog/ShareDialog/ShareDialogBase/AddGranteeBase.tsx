// (C) 2021-2025 GoodData Corporation
import React, { useCallback } from "react";
import { useIntl } from "react-intl";

import { ConfirmDialogBase } from "../../ConfirmDialogBase.js";
import { BackButton } from "../../BackButton.js";
import { ContentDivider } from "../../ContentDivider.js";

import { AddGranteeContent } from "./AddGranteeContent.js";
import { IAddGranteeBaseProps } from "./types.js";

/**
 * @internal
 */
export const AddGranteeBase: React.FC<IAddGranteeBaseProps> = (props) => {
    const {
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
        applyShareGrantOnSelect,
    } = props;
    const intl = useIntl();
    const {
        isLocked: isSharedObjectLocked,
        ref: sharedObjectRef,
        areGranularPermissionsSupported,
    } = sharedObject;

    const backButtonRenderer = useCallback(() => {
        return <BackButton onClick={onBackClick} className="s-share-dialog-navigate-back" />;
    }, [onBackClick]);

    return (
        <ConfirmDialogBase
            className="gd-share-dialog gd-share-dialog-add-users s-gd-share-add-grantees"
            displayCloseButton={true}
            isPositive={true}
            isSubmitDisabled={!isDirty}
            headline={intl.formatMessage({ id: "shareDialog.share.grantee.add.info" })}
            cancelButtonText={intl.formatMessage({ id: "cancel" })}
            submitButtonText={intl.formatMessage({ id: "shareDialog.share.grantee.share" })}
            submitOnEnterKey={false}
            shouldCloseOnEscape={true}
            returnFocusTo={previouslyFocusedRef}
            onCancel={onBackClick}
            onSubmit={onSubmit}
            onClose={onCancel}
            hideSubmitButton={applyShareGrantOnSelect}
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
                onAddUserOrGroups={onAddUserOrGroups}
                onDelete={onDelete}
                onGranularGranteeChange={onGranularGranteeChange}
                isGranteeShareLoading={isGranteeShareLoading}
            />
            <ContentDivider />
        </ConfirmDialogBase>
    );
};
