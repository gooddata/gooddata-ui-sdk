// (C) 2023-2025 GoodData Corporation

import { useEffect, useMemo, useState } from "react";

import stringify from "json-stable-stringify";

import { type IUser, type IUserGroup } from "@gooddata/sdk-model";
import { useBackendStrict } from "@gooddata/sdk-ui";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { messages } from "../locales.js";
import { useOrganizationId } from "../OrganizationIdContext.js";
import { useTelemetry } from "../TelemetryContext.js";

export const useUserDetails = (
    user: IUser,
    isAdmin: boolean,
    onSubmit: (user: IUser, isAdmin: boolean) => void,
    onCancel: () => void,
    removeAdminGroup: () => void,
) => {
    const { addSuccess, addError } = useToastMessage();
    const [updatedUser, setUpdatedUser] = useState(user);
    const [isUpdatedAdmin, setUpdatedAdmin] = useState(isAdmin);
    const backend = useBackendStrict();
    const organizationId = useOrganizationId();
    const [isProcessing, setIsProcessing] = useState(false);
    const trackEvent = useTelemetry();

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

        setIsProcessing(true);

        Promise.all([
            // update user details
            backend.organization(organizationId).users().updateUser(sanitizedUser),
            // grant or remove org manage rights if they are supposed to change
            updateAdmin
                ? backend
                      .organization(organizationId)
                      .permissions()
                      .updateOrganizationPermissions([
                          {
                              assigneeIdentifier: {
                                  id: sanitizedUser.login,
                                  type: "user",
                              },
                              permissions: isUpdatedAdmin ? ["MANAGE"] : [],
                          },
                      ])
                : Promise.resolve(),
            // remove admin group if org manage rights must be removed and user is its member
            updateAdmin && !isUpdatedAdmin ? removeAdminGroup() : Promise.resolve(),
        ])
            .then(() => {
                addSuccess(messages.userDetailsUpdatedSuccess);
                trackEvent("user-detail-updated");
                onSubmit(sanitizedUser, isUpdatedAdmin);
                onCancel();
            })
            .catch((error) => {
                console.error("Change of user details failed", error);
                addError(messages.userDetailsUpdatedFailure);
            })
            .finally(() => setIsProcessing(false));
    };

    const isDirty = useMemo(
        () => stringify(user) !== stringify(updatedUser) || isAdmin !== isUpdatedAdmin,
        [user, updatedUser, isAdmin, isUpdatedAdmin],
    );

    return {
        updatedUser,
        isUpdatedAdmin,
        onChange,
        onSave,
        isDirty,
        isProcessing,
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
    const [isProcessing, setIsProcessing] = useState(false);
    const trackEvent = useTelemetry();

    // update user group from props (when dialog is opened directly in edit mode and we wait for fetch result)
    useEffect(() => {
        setUpdatedUserGroup(userGroup);
    }, [userGroup]);

    const onSave = () => {
        setIsProcessing(true);
        backend
            .organization(organizationId)
            .users()
            .updateUserGroup(updatedUserGroup)
            .then(() => {
                addSuccess(messages.userGroupDetailsUpdatedSuccess);
                trackEvent("group-detail-updated");
                onSubmit(updatedUserGroup);
                onCancel();
            })
            .catch((error) => {
                console.error("Change of user userGroup details failed", error);
                addError(messages.userGroupDetailsUpdatedFailure);
            })
            .finally(() => setIsProcessing(false));
    };

    const isDirty = useMemo(
        () => stringify(userGroup) !== stringify(updatedUserGroup),
        [userGroup, updatedUserGroup],
    );

    return {
        updatedUserGroup,
        onChange: setUpdatedUserGroup,
        onSave,
        isDirty,
        isProcessing,
    };
};
