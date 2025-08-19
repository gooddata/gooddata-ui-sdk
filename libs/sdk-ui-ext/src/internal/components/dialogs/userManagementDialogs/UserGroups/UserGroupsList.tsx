// (C) 2023-2025 GoodData Corporation
import React, { useMemo } from "react";

import { UserGroupItem } from "./UserGroupItem.js";
import { UserGroupsListEmpty } from "./UserGroupsListEmpty.js";
import { IGrantedUserGroup, ListMode } from "../types.js";
import { sortByName } from "../utils.js";

export interface IUserGroupsListProps {
    userGroups: IGrantedUserGroup[];
    mode: ListMode;
    onDelete: (userGroup: IGrantedUserGroup) => void;
    isBootstrapUser: boolean;
    bootstrapUserGroupId: string;
}

export const UserGroupsList: React.FC<IUserGroupsListProps> = ({
    userGroups,
    mode,
    onDelete,
    isBootstrapUser,
    bootstrapUserGroupId,
}) => {
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
};
