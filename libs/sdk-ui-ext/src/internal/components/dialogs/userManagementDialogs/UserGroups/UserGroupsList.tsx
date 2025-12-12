// (C) 2023-2025 GoodData Corporation

import { useMemo } from "react";

import { UserGroupItem } from "./UserGroupItem.js";
import { UserGroupsListEmpty } from "./UserGroupsListEmpty.js";
import { type IGrantedUserGroup, type ListMode } from "../types.js";
import { sortByName } from "../utils.js";

export interface IUserGroupsListProps {
    userGroups: IGrantedUserGroup[];
    mode: ListMode;
    onDelete: (userGroup: IGrantedUserGroup) => void;
    isBootstrapUser: boolean;
    bootstrapUserGroupId: string;
}

export function UserGroupsList({
    userGroups,
    mode,
    onDelete,
    isBootstrapUser,
    bootstrapUserGroupId,
}: IUserGroupsListProps) {
    const sortedUserGroups = useMemo(() => {
        return userGroups ? [...userGroups].sort(sortByName) : [];
    }, [userGroups]);

    if (sortedUserGroups.length === 0) {
        return <UserGroupsListEmpty mode={mode} />;
    }

    return (
        <div className="gd-share-dialog-grantee-list s-user-management-user-list">
            {sortedUserGroups.map((userGroup) => {
                const isDeleteDisabled = isBootstrapUser && userGroup.id === bootstrapUserGroupId;
                return (
                    <UserGroupItem
                        key={userGroup.id}
                        userGroup={userGroup}
                        onDelete={onDelete}
                        isDeleteDisabled={isDeleteDisabled}
                        mode={mode}
                    />
                );
            })}
        </div>
    );
}
