// (C) 2021-2023 GoodData Corporation
import React, { useMemo } from "react";

import { sortByName } from "../utils.js";
import { ListMode, IUserMember } from "../types.js";
import { UsersListEmpty } from "./UsersListEmpty.js";
import { UserItem } from "./UserItem.js";

export interface IUsersListProps {
    users: IUserMember[];
    mode: ListMode;
    onDelete: (user: IUserMember) => void;
}

export const UsersList: React.FC<IUsersListProps> = ({ users, mode, onDelete }) => {
    const sortedUsers = useMemo(() => {
        return users ? [...users].sort(sortByName) : [];
    }, [users]);

    if (sortedUsers.length === 0) {
        return <UsersListEmpty mode={mode} />;
    }

    return (
        <div className="gd-share-dialog-grantee-list s-user-management-users-list">
            {sortedUsers.map((user) => {
                return <UserItem key={user.id} user={user} onDelete={onDelete} mode={mode} />;
            })}
        </div>
    );
};
