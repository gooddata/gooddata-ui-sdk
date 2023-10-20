// (C) 2021-2023 GoodData Corporation
import React, { useMemo } from "react";

import { sortGrantedWorkspacesByName } from "../utils.js";
import { WorkspaceListMode, IGrantedWorkspace } from "../types.js";

import { WorkspaceItem } from "./WorkspaceItem/WorkspaceItem.js";
import { WorkspaceListEmpty } from "./WorkspaceListEmpty.js";

/**
 * @internal
 */
export interface IWorkspaceListProps {
    workspaces: IGrantedWorkspace[];
    mode: WorkspaceListMode;
    onDelete: (workspace: IGrantedWorkspace) => void;
    onChange?: (workspace: IGrantedWorkspace) => void;
}

/**
 * @internal
 */
export const WorkspaceList: React.FC<IWorkspaceListProps> = ({ workspaces, mode, onChange, onDelete }) => {
    const sortedWorkspaces = useMemo(() => {
        return [...workspaces].sort(sortGrantedWorkspacesByName);
    }, [workspaces]);

    if (workspaces.length === 0) {
        return <WorkspaceListEmpty mode={mode} />;
    }

    return (
        <div className="gd-share-dialog-grantee-list">
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
