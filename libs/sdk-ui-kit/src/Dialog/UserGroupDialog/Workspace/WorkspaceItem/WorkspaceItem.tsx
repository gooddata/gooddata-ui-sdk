// (C) 2022-2023 GoodData Corporation

import React from "react";
import cx from "classnames";

import { WorkspaceIcon } from "../../../ShareDialog/ShareDialogBase/GranteeIcons.js";
import { IGrantedWorkspace } from "../../types.js";

import { usePermissionsDropdownState } from "./usePermissionsDropdownState.js";
import { PermissionsDropdown } from "./PermissionsDropdown.js";
import { HierarchicalPermissionsDropdown } from "./HierarchicalPermissionsDropdown.js";

interface IGranularGranteeGroupItemProps {
    workspace: IGrantedWorkspace;
    onChange: (grantee: IGrantedWorkspace) => void;
    onDelete: (grantee: IGrantedWorkspace) => void;
}

export const WorkspaceItem: React.FC<IGranularGranteeGroupItemProps> = ({ workspace, onChange, onDelete }) => {
    const { isDropdownOpen, toggleDropdown } = usePermissionsDropdownState();
    const { isDropdownOpen: isHierarchicalDropdownOpen, toggleDropdown: toggleHierarchicalDropdown } = usePermissionsDropdownState();

    const itemClassName = cx(
        "s-share-dialog-grantee-item",
        "gd-share-dialog-grantee-item",
        {
            "is-active": isDropdownOpen,
        },
    );

    return (
        <div className={itemClassName}>
            <HierarchicalPermissionsDropdown
                workspace={workspace}
                isDropdownOpen={isHierarchicalDropdownOpen}
                toggleDropdown={toggleHierarchicalDropdown}
                onChange={onChange}
                className="gd-grantee-granular-permission"
            />
            <PermissionsDropdown
                workspace={workspace}
                isDropdownOpen={isDropdownOpen}
                toggleDropdown={toggleDropdown}
                onChange={onChange}
                onDelete={onDelete}
                className="gd-grantee-granular-permission"
            />
            <div className="gd-grantee-content">
                <div className="gd-grantee-content-label">{workspace.title}</div>
            </div>
            <WorkspaceIcon />
        </div>
    );
};
