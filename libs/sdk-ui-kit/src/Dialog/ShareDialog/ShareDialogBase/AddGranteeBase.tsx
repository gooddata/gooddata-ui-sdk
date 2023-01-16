// (C) 2021-2022 GoodData Corporation
import React, { useCallback } from "react";
import { useIntl } from "react-intl";
import { Button } from "../../../Button";
import { ConfirmDialogBase } from "../../ConfirmDialogBase";
import { AddGranteeContent } from "./AddGranteeContent";
import { ContentDivider } from "./ContentDivider";
import { IAddGranteeBaseProps } from "./types";

interface IBackButtonProps {
    onClick: () => void;
}

const BackButton: React.FC<IBackButtonProps> = (props) => {
    const { onClick: onBackClick } = props;

    return (
        <Button
            value={""}
            className={
                "gd-button-primary gd-button-icon-only gd-icon-navigateleft gd-share-dialog-header-back-button s-share-dialog-navigate-back"
            }
            onClick={onBackClick}
        />
    );
};

/**
 * @internal
 */
export const AddGranteeBase: React.FC<IAddGranteeBaseProps> = (props) => {
    const {
        appliedGrantees,
        addedGrantees,
        currentUserRef,
        isDirty,
        areGranularPermissionsSupported,
        dashboardPermissions,
        sharedObjectRef,
        onCancel,
        onSubmit,
        onBackClick,
        onAddUserOrGroups,
        onDelete,
        onGranularGranteeChange,
    } = props;
    const intl = useIntl();

    const backButtonRenderer = useCallback(() => {
        return <BackButton onClick={onBackClick} />;
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
            onCancel={onBackClick}
            onSubmit={onSubmit}
            onClose={onCancel}
            headerLeftButtonRenderer={backButtonRenderer}
        >
            <AddGranteeContent
                dashboardPermissions={dashboardPermissions}
                currentUserRef={currentUserRef}
                addedGrantees={addedGrantees}
                appliedGrantees={appliedGrantees}
                areGranularPermissionsSupported={areGranularPermissionsSupported}
                sharedObjectRef={sharedObjectRef}
                onAddUserOrGroups={onAddUserOrGroups}
                onDelete={onDelete}
                onGranularGranteeChange={onGranularGranteeChange}
            />
            <ContentDivider />
        </ConfirmDialogBase>
    );
};
