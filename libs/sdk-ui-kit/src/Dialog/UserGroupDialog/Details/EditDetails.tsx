// (C) 2023 GoodData Corporation

import { useIntl } from "react-intl";
import React, { useCallback, useState, useMemo } from "react";
import { IWorkspaceUser } from "@gooddata/sdk-model";

import { IUserEditDialogApi } from "../types.js";
import { BackButton } from "../../BackButton.js";
import { ConfirmDialogBase } from "../../ConfirmDialogBase.js";
import { userDialogMessageLabels } from "../../../locales.js";
import { useToastMessage } from "../../../Messages/index.js";

import { DetailsView } from "./DetailsView.js";

/**
 * @internal
 */
export interface IAddWorkspaceBaseProps {
    api: IUserEditDialogApi;
    isAdmin: boolean;
    user: IWorkspaceUser;
    onSubmit: (user: IWorkspaceUser, isAdmin: boolean) => void;
    onCancel: () => void;
    onBackClick: () => void;
}

/**
 * @internal
 */
export const EditDetails: React.FC<IAddWorkspaceBaseProps> = ({
    api,
    user,
    isAdmin,
    onSubmit,
    onCancel,
    onBackClick
}) => {
    const intl = useIntl();
    const { addSuccess, addError } = useToastMessage();
    const [updatedUser, setUpdatedUser] = useState(user);
    const [isUpdatedAdmin, setUpdatedAdmin] = useState(isAdmin);

    const backButtonRenderer = useCallback(() => {
        return <BackButton onClick={onBackClick} className="s-user-group-dialog-navigate-back" />;
    }, [onBackClick]);

    const handleOnChange = (user: IWorkspaceUser, isAdmin: boolean) => {
        setUpdatedUser(user);
        setUpdatedAdmin(isAdmin);
    }

    const handleSubmit = () => {
        const updateAdmin = isAdmin !== isUpdatedAdmin;
        const { firstName, lastName } = updatedUser;
        const sanitizedUser: IWorkspaceUser = {
            ...updatedUser,
            fullName: firstName && lastName ? `${firstName} ${lastName}` : undefined
        }

        Promise
            .all([
                api.updateUserDetails(sanitizedUser),
                updateAdmin ? api.changeUserOrgAdminStatus(sanitizedUser.login, isUpdatedAdmin) : Promise.resolve(),
            ])
            .then(() => {
                addSuccess(userDialogMessageLabels.detailsUpdatedSuccess);
                onSubmit(sanitizedUser, isUpdatedAdmin);
                onBackClick();
            })
            .catch((error) => {
                console.error("Change of details", error);
                addError(userDialogMessageLabels.detailsUpdatedError);
            });
    };

    const isDirty = useMemo(
        () => JSON.stringify(user) !== JSON.stringify(updatedUser) || isAdmin !== isUpdatedAdmin,
        [user, updatedUser, isAdmin, isUpdatedAdmin],
    );

    return (
        <ConfirmDialogBase
            className="gd-share-dialog gd-share-dialog-add-users s-gd-share-add-grantees"
            displayCloseButton={true}
            isPositive={true}
            isSubmitDisabled={!isDirty}
            headline={user?.fullName ?? user?.login}
            cancelButtonText={intl.formatMessage({ id: "cancel" })}
            submitButtonText={intl.formatMessage({ id: "userGroupDialog.detail.saveButton" })}
            onCancel={onBackClick}
            onSubmit={handleSubmit}
            onClose={onCancel}
            headerLeftButtonRenderer={backButtonRenderer}
        >
            <DetailsView
                user={updatedUser}
                isAdmin={isUpdatedAdmin}
                mode="EDIT"
                onChange={handleOnChange}
            />
        </ConfirmDialogBase>
    );
};
