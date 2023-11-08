// (C) 2023 GoodData Corporation

import { useState } from "react";
import { useBackendStrict } from "@gooddata/sdk-ui";

import { IGrantedUserGroup } from "../types.js";
import { userManagementMessages } from "../../../locales.js";
import { sortByName } from "../utils.js";
import { useToastMessage } from "../../../Messages/index.js";
import { useOrganizationId } from "../OrganizationIdContext.js";

export const useAddUserGroup = (
    userIds: string[],
    onSubmit: (userGroups: IGrantedUserGroup[]) => void,
    onCancel: () => void,
) => {
    const { addSuccess, addError } = useToastMessage();
    const backend = useBackendStrict();
    const organizationId = useOrganizationId();
    const [addedUserGroups, setAddedUserGroups] = useState<IGrantedUserGroup[]>([]);

    const onDelete = (userGroup: IGrantedUserGroup) => {
        setAddedUserGroups(addedUserGroups.filter((item) => item.id !== userGroup.id));
    };

    const onAdd = () => {
        if (userIds.length === 1) {
            backend
                .organization(organizationId)
                .users()
                .addUserToUserGroups(
                    userIds[0],
                    addedUserGroups.map((userGroup) => userGroup.id),
                )
                .then(() => {
                    addSuccess(userManagementMessages.userGroupAddedSuccess);
                    onSubmit(addedUserGroups);
                    onCancel();
                })
                .catch((error) => {
                    console.error("Addition of user group membership failed", error);
                    addError(userManagementMessages.userGroupAddedFailure);
                });
        } else {
            backend
                .organization(organizationId)
                .users()
                .addUserGroupsToUsers(
                    addedUserGroups.map((userGroup) => userGroup.id),
                    userIds,
                )
                .then(() => {
                    addSuccess(userManagementMessages.userGroupsAddedSuccess);
                    onSubmit(addedUserGroups);
                    onCancel();
                })
                .catch((error) => {
                    console.error("Addition of user group memberships failed", error);
                    addError(userManagementMessages.userGroupsAddedFailure);
                });
        }
    };

    const onSelect = ({ id, title }: IGrantedUserGroup) => {
        setAddedUserGroups(
            [
                ...addedUserGroups,
                {
                    id,
                    title,
                },
            ].sort(sortByName),
        );
    };

    return {
        addedUserGroups,
        onAdd,
        onDelete,
        onSelect,
    };
};
