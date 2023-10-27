// (C) 2021-2023 GoodData Corporation
import React, { useMemo } from "react";

import { sortByName } from "../utils.js";
import { IGrantedWorkspace, ListMode } from "../types.js";

import { WorkspaceItem } from "./WorkspaceItem/WorkspaceItem.js";
import { WorkspaceListEmpty } from "./WorkspaceListEmpty.js";

export interface IWorkspaceListProps {
    workspaces: IGrantedWorkspace[];
    mode: ListMode;
    onDelete: (workspace: IGrantedWorkspace) => void;
    onChange?: (workspace: IGrantedWorkspace) => void;
}

export const WorkspaceList: React.FC<IWorkspaceListProps> = ({ workspaces, mode, onChange, onDelete }) => {
    const sortedWorkspaces = useMemo(() => {
        return workspaces ? [...workspaces].sort(sortByName) : [];
    }, [workspaces]);

    if (sortedWorkspaces.length === 0) {
        return <WorkspaceListEmpty mode={mode} />;
    }

    return (
        <div className="gd-share-dialog-grantee-list s-user-management-workspaces">
            {sortedWorkspaces.map((workspace) => {
                return (
                    <WorkspaceItem
                        key={workspace.id}
                        workspace={workspace}
                        onChange={onChange}
                        onDelete={onDelete}
                    />
                );
            })}
        </div>
    );
};
