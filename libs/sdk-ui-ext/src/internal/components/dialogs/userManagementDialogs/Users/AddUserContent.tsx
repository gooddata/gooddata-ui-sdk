// (C) 2023-2026 GoodData Corporation

import { type IUserMember } from "../types.js";

import { AddUserSelect } from "./AddUserSelect.js";
import { UsersList } from "./UsersList.js";

export interface IAddUserContentProps {
    addedUsers: IUserMember[];
    grantedUsers: IUserMember[];
    onSelect: (user: IUserMember) => void;
    onDelete: (user: IUserMember) => void;
}

export function AddUserContent({ addedUsers, grantedUsers, onDelete, onSelect }: IAddUserContentProps) {
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
}
