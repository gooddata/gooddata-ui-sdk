// (C) 2023 GoodData Corporation

import { IUserMember } from "../types.js";
import { useBackendStrict } from "@gooddata/sdk-ui";
import { useOrganizationId } from "../OrganizationIdContext.js";
import { useState } from "react";
import { useToastMessage } from "../../../Messages/index.js";
import { userManagementMessages } from "../../../locales.js";
import { sortByName } from "../utils.js";

export const useAddUsers = (
    userGroupIds: string[],
    onSave: (users: IUserMember[]) => void,
    onCancel: () => void,
) => {
    const backend = useBackendStrict();
    const organizationId = useOrganizationId();
    const [addedUsers, setAddedUsers] = useState<IUserMember[]>([]);
    const { addSuccess, addError } = useToastMessage();

    const onDelete = (user: IUserMember) => {
        setAddedUsers(addedUsers.filter((item) => item.id !== user.id));
    };

    const onAdd = () => {
        if (userGroupIds.length === 1) {
            backend
                .organization(organizationId)
                .users()
                .addUserGroupToUsers(
                    userGroupIds[0],
                    addedUsers.map((user) => user.id),
                )
                .then(() => {
                    addSuccess(userManagementMessages.usersAddedSuccess);
                    onSave(addedUsers);
                    onCancel();
                })
                .catch((error) => {
                    console.error("Addition of user group members failed", error);
                    addError(userManagementMessages.usersAddedFailure);
                });
        } else {
            backend
                .organization(organizationId)
                .users()
                .addUserGroupsToUsers(
                    userGroupIds,
                    addedUsers.map((user) => user.id),
                )
                .then(() => {
                    addSuccess(userManagementMessages.usersAddedToUserGroupsSuccess);
                    onSave(addedUsers);
                    onCancel();
                })
                .catch((error) => {
                    console.error("Addition of user groups members failed", error);
                    addError(userManagementMessages.usersAddedToUserGroupsFailure);
                });
        }
    };

    const onSelect = (user: IUserMember) => {
        setAddedUsers([...addedUsers, user].sort(sortByName));
    };

    return {
        addedUsers,
        onDelete,
        onAdd,
        onSelect,
    };
};
