// (C) 2023 GoodData Corporation

import { useState } from "react";
import { useBackendStrict } from "@gooddata/sdk-ui";

import { IGrantedUserGroup } from "../types.js";
import { userManagementMessages } from "../../../locales.js";
import { sortByName } from "../utils.js";
import { useToastMessage } from "../../../Messages/index.js";
import { useOrganizationId } from "../OrganizationIdContext.js";

export const useAddUserGroup = (
    userId: string,
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
        backend
            .organization(organizationId)
            .users()
            .addUserToUserGroups(
                userId,
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
