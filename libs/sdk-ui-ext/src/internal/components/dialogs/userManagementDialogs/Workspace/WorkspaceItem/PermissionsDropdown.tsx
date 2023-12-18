// (C) 2023 GoodData Corporation

import React, { useCallback, useState } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";
import { withBubble } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

import {
    WorkspacePermission,
    IPermissionsItem,
    IGrantedWorkspace,
    WorkspacePermissionSubject,
} from "../../types.js";
import { useTelemetry, TrackEventCallback } from "../../TelemetryContext.js";

import { workspacePermissionMessages } from "./locales.js";
import { PermissionsDropdownList } from "./PermissionsDropdownList.js";

const items: IPermissionsItem[] = [
    {
        id: "MANAGE",
        enabled: true,
    },
    {
        id: "ANALYZE_AND_EXPORT",
        enabled: true,
    },
    {
        id: "ANALYZE",
        enabled: true,
    },
    {
        id: "VIEW_AND_EXPORT",
        enabled: true,
    },
    {
        id: "VIEW",
        enabled: true,
    },
];

interface IGranularPermissionsDropdownProps {
    workspace: IGrantedWorkspace;
    subjectType: WorkspacePermissionSubject;
    isDropdownDisabled?: boolean;
    isDropdownOpen: boolean;
    toggleDropdown: () => void;
    onChange: (workspace: IGrantedWorkspace) => void;
    onDelete: (workspace: IGrantedWorkspace) => void;
    className: string;
}

const trackPermissionChange = (
    trackEvent: TrackEventCallback,
    subjectType: WorkspacePermissionSubject,
    permission: WorkspacePermission,
) => {
    switch (permission) {
        case "VIEW":
            trackEvent(
                subjectType === "user"
                    ? "user-permission-changed-to-view"
                    : "group-permission-changed-to-view",
            );
            break;
        case "VIEW_AND_EXPORT":
            trackEvent(
                subjectType === "user"
                    ? "user-permission-changed-to-view-export"
                    : "group-permission-changed-to-view-export",
            );
            break;
        case "ANALYZE":
            trackEvent(
                subjectType === "user"
                    ? "user-permission-changed-to-analyze"
                    : "group-permission-changed-to-analyze",
            );
            break;
        case "ANALYZE_AND_EXPORT":
            trackEvent(
                subjectType === "user"
                    ? "user-permission-changed-to-analyze-export"
                    : "group-permission-changed-to-analyze-export",
            );
            break;
        case "MANAGE":
            trackEvent(
                subjectType === "user"
                    ? "user-permission-changed-to-manage"
                    : "group-permission-changed-to-manage",
            );
            break;
    }
};

const Dropdown: React.FC<IGranularPermissionsDropdownProps> = ({
    workspace,
    subjectType,
    isDropdownDisabled,
    isDropdownOpen,
    toggleDropdown,
    onChange,
    onDelete,
    className,
}) => {
    const intl = useIntl();
    const [selectedPermission, setSelectedPermission] = useState<WorkspacePermission>(workspace.permission);
    const trackEvent = useTelemetry();

    const handleOnSelect = (permission: WorkspacePermission) => {
        onChange({ ...workspace, permission });
        trackPermissionChange(trackEvent, subjectType, permission);
        setSelectedPermission(permission);
    };

    const handleOnDelete = () => {
        onDelete(workspace);
    };

    const handleClick = useCallback(() => {
        if (!isDropdownDisabled) {
            toggleDropdown();
        }
    }, [isDropdownDisabled, toggleDropdown]);

    const buttonValue = intl.formatMessage(workspacePermissionMessages[selectedPermission]);

    return (
        <div className={className}>
            <div
                className={cx(
                    "s-user-management-permission-button",
                    "gd-granular-permission-button",
                    "dropdown-button",
                    `gd-granular-permission-button-${stringUtils.simplifyText(workspace.id)}`,
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
                items={items}
                subjectType={subjectType}
                onSelect={handleOnSelect}
                onDelete={handleOnDelete}
                toggleDropdown={toggleDropdown}
                isShowDropdown={isDropdownOpen}
                alignTo={`.gd-granular-permission-button-${stringUtils.simplifyText(workspace.id)}`}
            />
        </div>
    );
};

export const PermissionsDropdown = withBubble(Dropdown);
