// (C) 2023-2025 GoodData Corporation

import { IGrantedUserGroup } from "../types.js";

import { UserGroupsList } from "./UserGroupsList.js";
import { AddUserGroupSelect } from "./AddUserGroupSelect.js";

export interface IAddUserGroupContentProps {
    addedUserGroups: IGrantedUserGroup[];
    grantedUserGroups: IGrantedUserGroup[];
    onDelete: (userGroup: IGrantedUserGroup) => void;
    onSelect: (userGroup: IGrantedUserGroup) => void;
}

export function AddUserGroupContent({
    addedUserGroups,
    grantedUserGroups,
    onSelect,
    onDelete,
}: IAddUserGroupContentProps) {
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
}
