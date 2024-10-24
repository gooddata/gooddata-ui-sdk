// (C) 2023-2024 GoodData Corporation

import React from "react";
import cx from "classnames";

import { IGrantedWorkspace, WorkspacePermissionSubject } from "../../types.js";

import { usePermissionsDropdownState } from "./usePermissionsDropdownState.js";
import { PermissionsDropdown } from "./PermissionsDropdown.js";
import { HierarchicalPermissionsDropdown } from "./HierarchicalPermissionsDropdown.js";
import { WorkspaceIcon } from "./WorkspaceIcon.js";

interface IGranularGranteeUserGroupItemProps {
    workspace: IGrantedWorkspace;
    subjectType: WorkspacePermissionSubject;
    onChange: (grantee: IGrantedWorkspace) => void;
    onDelete: (grantee: IGrantedWorkspace) => void;
    areFilterViewsEnabled: boolean;
}

export const WorkspaceItem: React.FC<IGranularGranteeUserGroupItemProps> = ({
    workspace,
    subjectType,
    onChange,
    onDelete,
    areFilterViewsEnabled,
}) => {
    const { isDropdownOpen, toggleDropdown } = usePermissionsDropdownState();
    const { isDropdownOpen: isHierarchicalDropdownOpen, toggleDropdown: toggleHierarchicalDropdown } =
        usePermissionsDropdownState();

    const itemClassName = cx("s-user-management-workspace-item", "gd-share-dialog-grantee-item", {
        "is-active": isDropdownOpen,
    });

    return (
        <div className={itemClassName}>
            <HierarchicalPermissionsDropdown
                workspace={workspace}
                subjectType={subjectType}
                isDropdownOpen={isHierarchicalDropdownOpen}
                toggleDropdown={toggleHierarchicalDropdown}
                onChange={onChange}
                className="gd-grantee-granular-permission"
            />
            <PermissionsDropdown
                workspace={workspace}
                subjectType={subjectType}
                isDropdownOpen={isDropdownOpen}
                toggleDropdown={toggleDropdown}
                onChange={onChange}
                onDelete={onDelete}
                className="gd-grantee-granular-permission"
                areFilterViewsEnabled={areFilterViewsEnabled}
            />
            <div className="gd-grantee-content">
                <div className="gd-grantee-content-label">{workspace.title}</div>
            </div>
            <WorkspaceIcon />
        </div>
    );
};
