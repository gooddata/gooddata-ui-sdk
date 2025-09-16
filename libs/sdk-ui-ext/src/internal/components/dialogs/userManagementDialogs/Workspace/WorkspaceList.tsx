// (C) 2021-2025 GoodData Corporation

import { useMemo } from "react";

import { GranularPermissionsWorkspaceItem } from "./WorkspaceItem/GranularPermissionsWorkspaceItem.js";
import { WorkspaceListEmpty } from "./WorkspaceListEmpty.js";
import { IGrantedWorkspace, ListMode, WorkspacePermissionSubject } from "../types.js";
import { sortByName } from "../utils.js";

export interface IWorkspaceListProps {
    workspaces: IGrantedWorkspace[];
    subjectType: WorkspacePermissionSubject;
    mode: ListMode;
    onDelete: (workspace: IGrantedWorkspace) => void;
    onChange?: (workspace: IGrantedWorkspace) => void;
    onClick?: (workspace: IGrantedWorkspace) => void;
    areFilterViewsEnabled: boolean;
}

export function WorkspaceList({ workspaces, subjectType, mode, onDelete, onClick }: IWorkspaceListProps) {
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
}
