// (C) 2023 GoodData Corporation
import React from "react";

import { IGrantedUserGroup } from "../types.js";

import { UserGroupsList } from "./UserGroupsList.js";
import { AddUserGroupSelect } from "./AddUserGroupSelect.js";

export interface IAddUserGroupContentProps {
    addedUserGroups: IGrantedUserGroup[];
    grantedUserGroups: IGrantedUserGroup[];
    onDelete: (userGroup: IGrantedUserGroup) => void;
    onSelect: (userGroup: IGrantedUserGroup) => void;
}

export const AddUserGroupContent: React.FC<IAddUserGroupContentProps> = ({
    addedUserGroups,
    grantedUserGroups,
    onDelete,
    onSelect,
}) => {
    return (
        <>
            <AddUserGroupSelect
                addedUserGroups={addedUserGroups}
                grantedUserGroups={grantedUserGroups}
                onSelect={onSelect}
            />
            <UserGroupsList
                mode="EDIT"
                userGroups={addedUserGroups}
                onDelete={onDelete}
                // we do not care about bootstrap user here (this is important only in view mode)
                isBootstrapUser={false}
                bootstrapUserGroupId={undefined}
            />
        </>
    );
};
