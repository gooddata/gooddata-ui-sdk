// (C) 2021-2024 GoodData Corporation
import React, { useMemo } from "react";

import { sortByName } from "../utils.js";
import { IGrantedWorkspace, ListMode, WorkspacePermissionSubject } from "../types.js";
import { WorkspaceListEmpty } from "./WorkspaceListEmpty.js";
import { GranularPermissionsWorkspaceItem } from "./WorkspaceItem/GranularPermissionsWorkspaceItem.js";

export interface IWorkspaceListProps {
    workspaces: IGrantedWorkspace[];
    subjectType: WorkspacePermissionSubject;
    mode: ListMode;
    onDelete: (workspace: IGrantedWorkspace) => void;
    onChange?: (workspace: IGrantedWorkspace) => void;
    onClick?: (workspace: IGrantedWorkspace) => void;
    areFilterViewsEnabled: boolean;
}

export const WorkspaceList: React.FC<IWorkspaceListProps> = ({
    workspaces,
    subjectType,
    mode,
    onDelete,
    onClick,
}) => {
    const sortedWorkspaces = useMemo(() => {
        return workspaces ? [...workspaces].sort(sortByName) : [];
    }, [workspaces]);

    if (sortedWorkspaces.length === 0) {
        return <WorkspaceListEmpty mode={mode} subjectType={subjectType} />;
    }

    return (
        <div className="gd-share-dialog-grantee-list s-user-management-workspaces">
            {sortedWorkspaces.map((workspace) => {
                return (
                    <GranularPermissionsWorkspaceItem
                        key={workspace.id}
                        workspace={workspace}
                        onDelete={onDelete}
                        onClick={onClick}
                    />
                );
            })}
        </div>
    );
};
