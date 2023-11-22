// (C) 2023 GoodData Corporation
import React from "react";

import { IUserMember } from "../types.js";
import { AddUserSelect } from "./AddUserSelect.js";
import { UsersList } from "./UsersList.js";

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
            <UsersList mode="EDIT" users={addedUsers} onDelete={onDelete} />
        </>
    );
};
