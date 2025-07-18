// (C) 2021-2025 GoodData Corporation
import { useMemo } from "react";

import { sortByName } from "../utils.js";
import { ListMode, IUserMember } from "../types.js";
import { UsersListEmpty } from "./UsersListEmpty.js";
import { UserItem } from "./UserItem.js";

export interface IUsersListProps {
    users: IUserMember[];
    mode: ListMode;
    onDelete: (user: IUserMember) => void;
    isBootstrapUserGroup: boolean;
    bootstrapUserId: string;
}

export function UsersList({ users, mode, onDelete, isBootstrapUserGroup, bootstrapUserId }: IUsersListProps) {
    const sortedUsers = useMemo(() => {
        return users ? [...users].sort(sortByName) : [];
    }, [users]);

    if (sortedUsers.length === 0) {
        return <UsersListEmpty mode={mode} />;
    }

    return (
        <div className="gd-share-dialog-grantee-list s-user-management-users-list">
            {sortedUsers.map((user) => {
                const isDeleteDisabled = isBootstrapUserGroup && user.id === bootstrapUserId;
                return (
                    <UserItem
                        key={user.id}
                        user={user}
                        onDelete={onDelete}
                        isDeleteDisabled={isDeleteDisabled}
                        mode={mode}
                    />
                );
            })}
        </div>
    );
}
