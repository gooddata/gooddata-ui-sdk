// (C) 2023-2025 GoodData Corporation
import React from "react";

import { AddUserSelect } from "./AddUserSelect.js";
import { UsersList } from "./UsersList.js";
import { IUserMember } from "../types.js";

export interface IAddUserContentProps {
    addedUsers: IUserMember[];
    grantedUsers: IUserMember[];
    onSelect: (user: IUserMember) => void;
    onDelete: (user: IUserMember) => void;
}

export const AddUserContent: React.FC<IAddUserContentProps> = ({
    addedUsers,
    grantedUsers,
    onDelete,
    onSelect,
}) => {
    return (
        <>
            <AddUserSelect addedUsers={addedUsers} grantedUsers={grantedUsers} onSelect={onSelect} />
            <UsersList
                mode="EDIT"
                users={addedUsers}
                onDelete={onDelete}
                // we do not care about bootstrap user group here (this is important only in view mode)
                isBootstrapUserGroup={false}
                bootstrapUserId={undefined}
            />
        </>
    );
};
