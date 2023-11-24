// (C) 2021-2023 GoodData Corporation
import React, { useMemo } from "react";

import { sortByName } from "../utils.js";
import { IGrantedWorkspace, ListMode, WorkspacePermissionSubject } from "../types.js";

import { WorkspaceItem } from "./WorkspaceItem/WorkspaceItem.js";
import { WorkspaceListEmpty } from "./WorkspaceListEmpty.js";

export interface IWorkspaceListProps {
    workspaces: IGrantedWorkspace[];
    subjectType: WorkspacePermissionSubject;
    mode: ListMode;
    onDelete: (workspace: IGrantedWorkspace) => void;
    onChange?: (workspace: IGrantedWorkspace) => void;
}

export const WorkspaceList: React.FC<IWorkspaceListProps> = ({
    workspaces,
    subjectType,
    mode,
    onChange,
    onDelete,
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
                    <WorkspaceItem
                        key={workspace.id}
                        workspace={workspace}
                        subjectType={subjectType}
                        onChange={onChange}
                        onDelete={onDelete}
                    />
                );
            })}
        </div>
    );
};
