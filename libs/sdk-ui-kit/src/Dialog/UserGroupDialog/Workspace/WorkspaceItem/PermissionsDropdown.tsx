// (C) 2022-2023 GoodData Corporation

import React, { useCallback, useState } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";
import {
    workspacePermissionMessageLabels,
    workspacePermissionTooltipMessageLabels
} from "../../../../locales.js";

import { withBubble } from "../../../../Bubble/index.js";
import { WorkspacePermission, IPermissionsItem, IGrantedWorkspace } from "../../types.js";
import { PermissionsDropdownList } from "./PermissionsDropdownList.js";

const items: IPermissionsItem[] = [{
    id: "MANAGE",
    tooltip: workspacePermissionTooltipMessageLabels["MANAGE"].id,
    enabled: true,
}, {
    id: "ANALYZE_AND_EXPORT",
    tooltip: workspacePermissionTooltipMessageLabels["ANALYZE_AND_EXPORT"].id,
    enabled: true,
}, {
    id: "ANALYZE",
    tooltip: workspacePermissionTooltipMessageLabels["ANALYZE"].id,
    enabled: true,
}, {
    id: "VIEW_AND_EXPORT",
    tooltip: workspacePermissionTooltipMessageLabels["VIEW_AND_EXPORT"].id,
    enabled: true,
}, {
    id: "VIEW",
    tooltip: workspacePermissionMessageLabels["VIEW"].id,
    enabled: true,
}];

interface IGranularPermissionsDropdownProps {
    workspace: IGrantedWorkspace;
    isDropdownDisabled?: boolean;
    isDropdownOpen: boolean;
    toggleDropdown: () => void;
    onChange: (workspace: IGrantedWorkspace) => void;
    onDelete: (workspace: IGrantedWorkspace) => void;
    className: string;
}

const Dropdown: React.FC<IGranularPermissionsDropdownProps> = ({
    workspace,
    isDropdownDisabled,
    isDropdownOpen,
    toggleDropdown,
    onChange,
    onDelete,
    className,
}) => {
    const intl = useIntl();

    const [selectedPermission, setSelectedPermission] = useState<WorkspacePermission>(
        workspace.permission,
    );
    const handleOnSelect = (permission: WorkspacePermission) => {
        onChange({...workspace, permission});
        setSelectedPermission(permission);
    };

    const handleOnDelete = () => {
        onDelete(workspace);
    }

    const handleClick = useCallback(() => {
        if (!isDropdownDisabled) {
            toggleDropdown();
        }
    }, [isDropdownDisabled, toggleDropdown]);

    const buttonValue = intl.formatMessage(workspacePermissionMessageLabels[selectedPermission]);

    return (
        <div className={className}>
            <div
                className={cx(
                    "s-granular-permission-button",
                    "gd-granular-permission-button",
                    "dropdown-button",
                    `gd-granular-permission-button-${workspace.id}`,
                    {
                        "is-active": isDropdownOpen,
                        "gd-icon-navigateup": !isDropdownDisabled && isDropdownOpen,
                        "gd-icon-navigatedown": !isDropdownDisabled && !isDropdownOpen,
                        disabled: isDropdownDisabled,
                        "gd-icon-right": !isDropdownDisabled,
                    },
                )}
                onClick={handleClick}
                aria-label="Share dialog granular permissions button"
            >
                <div className="s-granular-permission-button-title gd-granular-permission-button-title">
                    {buttonValue}
                </div>
            </div>
            <PermissionsDropdownList
                selectedPermission={selectedPermission}
                items={items}
                onSelect={handleOnSelect}
                onDelete={handleOnDelete}
                toggleDropdown={toggleDropdown}
                isShowDropdown={isDropdownOpen}
                alignTo={`.gd-granular-permission-button-${workspace.id}`}
            />
        </div>
    );
};

export const PermissionsDropdown = withBubble(Dropdown);
