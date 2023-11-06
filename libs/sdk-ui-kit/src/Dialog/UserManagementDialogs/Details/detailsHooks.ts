// (C) 2023 GoodData Corporation

import { useMemo, useState, useEffect } from "react";
import { IUser, IUserGroup } from "@gooddata/sdk-model";
import { useBackendStrict } from "@gooddata/sdk-ui";

import { userManagementMessages } from "../../../locales.js";
import { useToastMessage } from "../../../Messages/index.js";
import { useOrganizationId } from "../OrganizationIdContext.js";

export const useUserDetails = (
    user: IUser,
    isAdmin: boolean,
    onSubmit: (user: IUser, isAdmin: boolean) => void,
    onCancel: () => void,
) => {
    const { addSuccess, addError } = useToastMessage();
    const [updatedUser, setUpdatedUser] = useState(user);
    const [isUpdatedAdmin, setUpdatedAdmin] = useState(isAdmin);
    const backend = useBackendStrict();
    const organizationId = useOrganizationId();

    // update user group from props (when dialog is opened directly in edit mode and we wait for fetch result)
    useEffect(() => {
        setUpdatedUser(user);
    }, [user]);

    const onChange = (user: IUser, isAdmin: boolean) => {
        setUpdatedUser(user);
        setUpdatedAdmin(isAdmin);
    };

    const onSave = () => {
        const updateAdmin = isAdmin !== isUpdatedAdmin;
        const { firstName, lastName } = updatedUser;
        const sanitizedUser: IUser = {
            ...updatedUser,
            fullName: firstName && lastName ? `${firstName} ${lastName}` : undefined,
        };

        Promise.all([
            backend.organization(organizationId).users().updateUser(sanitizedUser),
            updateAdmin
                ? backend
                      .organization(organizationId)
                      .permissions()
                      .updateUserOrganizationAdminStatus(sanitizedUser.login, isUpdatedAdmin)
                : Promise.resolve(),
        ])
            .then(() => {
                addSuccess(userManagementMessages.userDetailsUpdatedSuccess);
                onSubmit(sanitizedUser, isUpdatedAdmin);
                onCancel();
            })
            .catch((error) => {
                console.error("Change of user details failed", error);
                addError(userManagementMessages.userDetailsUpdatedFailure);
            });
    };

    const isDirty = useMemo(
        () => JSON.stringify(user) !== JSON.stringify(updatedUser) || isAdmin !== isUpdatedAdmin,
        [user, updatedUser, isAdmin, isUpdatedAdmin],
    );

    return {
        updatedUser,
        isUpdatedAdmin,
        onChange,
        onSave,
        isDirty,
    };
};

export const useUserGroupDetails = (
    userGroup: IUserGroup,
    onSubmit: (userGroup: IUserGroup) => void,
    onCancel: () => void,
) => {
    const { addSuccess, addError } = useToastMessage();
    const [updatedUserGroup, setUpdatedUserGroup] = useState(userGroup);
    const backend = useBackendStrict();
    const organizationId = useOrganizationId();

    // update user group from props (when dialog is opened directly in edit mode and we wait for fetch result)
    useEffect(() => {
        setUpdatedUserGroup(userGroup);
    }, [userGroup]);

    const onSave = () => {
        backend
            .organization(organizationId)
            .users()
            .updateUserGroup(updatedUserGroup)
            .then(() => {
                addSuccess(userManagementMessages.userGroupDetailsUpdatedSuccess);
                onSubmit(updatedUserGroup);
                onCancel();
            })
            .catch((error) => {
                console.error("Change of user userGroup details failed", error);
                addError(userManagementMessages.userGroupDetailsUpdatedFailure);
            });
    };

    const isDirty = useMemo(
        () => JSON.stringify(userGroup) !== JSON.stringify(updatedUserGroup),
        [userGroup, updatedUserGroup],
    );

    return {
        updatedUserGroup,
        onChange: setUpdatedUserGroup,
        onSave,
        isDirty,
    };
};
