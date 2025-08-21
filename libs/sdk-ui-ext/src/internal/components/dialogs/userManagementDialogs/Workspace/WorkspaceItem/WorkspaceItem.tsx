// (C) 2023-2025 GoodData Corporation

import React from "react";

import cx from "classnames";

import { HierarchicalPermissionsDropdown } from "./HierarchicalPermissionsDropdown.js";
import { PermissionsDropdown } from "./PermissionsDropdown.js";
import { usePermissionsDropdownState } from "./usePermissionsDropdownState.js";
import { WorkspaceIcon } from "./WorkspaceIcon.js";
import { IGrantedWorkspace, WorkspacePermissionSubject } from "../../types.js";

interface IGranularGranteeUserGroupItemProps {
    workspace: IGrantedWorkspace;
    subjectType: WorkspacePermissionSubject;
    onChange: (grantee: IGrantedWorkspace) => void;
    onDelete: (grantee: IGrantedWorkspace) => void;
    areFilterViewsEnabled: boolean;
}

export function WorkspaceItem({
    workspace,
    subjectType,
    onChange,
    onDelete,
    areFilterViewsEnabled,
}: IGranularGranteeUserGroupItemProps) {
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
}
