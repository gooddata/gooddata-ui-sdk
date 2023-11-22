// (C) 2023 GoodData Corporation
import React, { useMemo } from "react";

import { sortByName } from "../utils.js";
import { ListMode, IGrantedUserGroup } from "../types.js";

import { UserGroupsListEmpty } from "./UserGroupsListEmpty.js";
import { UserGroupItem } from "./UserGroupItem.js";

export interface IUserGroupsListProps {
    userGroups: IGrantedUserGroup[];
    mode: ListMode;
    onDelete: (userGroup: IGrantedUserGroup) => void;
}

export const UserGroupsList: React.FC<IUserGroupsListProps> = ({ userGroups, mode, onDelete }) => {
    const sortedUserGroups = useMemo(() => {
        return userGroups ? [...userGroups].sort(sortByName) : [];
    }, [userGroups]);

    if (sortedUserGroups.length === 0) {
        return <UserGroupsListEmpty mode={mode} />;
    }

    return (
        <div className="gd-share-dialog-grantee-list s-user-management-user-list">
            {sortedUserGroups.map((userGroup) => {
                return (
                    <UserGroupItem key={userGroup.id} userGroup={userGroup} onDelete={onDelete} mode={mode} />
                );
            })}
        </div>
    );
};
