// (C) 2023 GoodData Corporation

import React, { useCallback, useState } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";
import { withBubble } from "@gooddata/sdk-ui-kit";

import { IGrantedWorkspace } from "../../types.js";

import { hierarchicalPermissionMessages } from "./locales.js";
import { PermissionsDropdownList } from "./HierarchicalPermissionsDropdownList.js";

interface IGranularPermissionsDropdownProps {
    workspace: IGrantedWorkspace;
    isDropdownDisabled?: boolean;
    isDropdownOpen: boolean;
    toggleDropdown: () => void;
    onChange: (workspace: IGrantedWorkspace) => void;
    className: string;
}

const Dropdown: React.FC<IGranularPermissionsDropdownProps> = ({
    workspace,
    isDropdownDisabled,
    isDropdownOpen,
    toggleDropdown,
    onChange,
    className,
}) => {
    const intl = useIntl();

    const [selectedPermission, setSelectedPermission] = useState<boolean>(workspace.isHierarchical);
    const handleOnSelect = (isHierarchical: boolean) => {
        onChange({ ...workspace, isHierarchical });
        setSelectedPermission(isHierarchical);
    };

    const handleClick = useCallback(() => {
        if (!isDropdownDisabled) {
            toggleDropdown();
        }
    }, [isDropdownDisabled, toggleDropdown]);

    const buttonValue = intl.formatMessage(
        selectedPermission ? hierarchicalPermissionMessages.enabled : hierarchicalPermissionMessages.disabled,
    );

    return (
        <div className={className}>
            <div
                className={cx(
                    "s-user-management-permission-button",
                    "gd-granular-permission-button",
                    "dropdown-button",
                    `gd-granular-hierarchical-permission-button-${workspace.id}`,
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
                <div className="s-user-management-button-title gd-granular-permission-button-title">
                    {buttonValue}
                </div>
            </div>
            <PermissionsDropdownList
                selectedPermission={selectedPermission}
                onSelect={handleOnSelect}
                toggleDropdown={toggleDropdown}
                isShowDropdown={isDropdownOpen}
                alignTo={`.gd-granular-hierarchical-permission-button-${workspace.id}`}
            />
        </div>
    );
};

export const HierarchicalPermissionsDropdown = withBubble(Dropdown);
