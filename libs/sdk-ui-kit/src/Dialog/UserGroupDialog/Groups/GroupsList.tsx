// (C) 2021-2023 GoodData Corporation
import React, { useMemo } from "react";

import { sortGrantedGroupsByName } from "../utils.js";
import { GroupsListMode, IGrantedGroup } from "../types.js";

import { GroupsListEmpty } from "./GroupsListEmpty.js";
import { GroupItem } from "./GroupItem.js";

/**
 * @internal
 */
export interface IWorkspaceListProps {
    groups: IGrantedGroup[];
    mode: GroupsListMode;
    onDelete: (group: IGrantedGroup) => void;
}

/**
 * @internal
 */
export const GroupsList: React.FC<IWorkspaceListProps> = ({ groups, mode, onDelete }) => {
    const sortedGroups = useMemo(() => {
        return [...groups].sort(sortGrantedGroupsByName);
    }, [groups]);

    if (groups.length === 0) {
        return <GroupsListEmpty mode={mode} />;
    }

    return (
        <div className="gd-share-dialog-grantee-list">
            {sortedGroups.map((group) => {
                return (
                    <GroupItem
                        key={group.id}
                        group={group}
                        onDelete={onDelete}
                        mode={mode}
                    />
                );
            })}
        </div>
    );
};
