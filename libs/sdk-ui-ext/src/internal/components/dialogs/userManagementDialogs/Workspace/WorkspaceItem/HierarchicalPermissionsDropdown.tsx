// (C) 2023-2025 GoodData Corporation

import { useCallback, useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { withBubble } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

import { PermissionsDropdownList } from "./HierarchicalPermissionsDropdownList.js";
import { hierarchicalPermissionMessages } from "./locales.js";
import { TrackEventCallback, useTelemetry } from "../../TelemetryContext.js";
import { IGrantedWorkspace, WorkspacePermissionSubject } from "../../types.js";

const trackPermissionChange = (
    trackEvent: TrackEventCallback,
    subjectType: WorkspacePermissionSubject,
    isHierarchical: boolean,
) => {
    if (subjectType === "user") {
        trackEvent(
            isHierarchical
                ? "user-permission-changed-to-hierarchy"
                : "user-permission-changed-to-single-workspace",
        );
    } else {
        trackEvent(
            isHierarchical
                ? "group-permission-changed-to-hierarchy"
                : "group-permission-changed-to-single-workspace",
        );
    }
};

interface IGranularPermissionsDropdownProps {
    workspace: IGrantedWorkspace;
    subjectType: WorkspacePermissionSubject;
    isDropdownDisabled?: boolean;
    isDropdownOpen: boolean;
    toggleDropdown: () => void;
    onChange: (workspace: IGrantedWorkspace) => void;
    className: string;
}

function Dropdown({
    workspace,
    subjectType,
    isDropdownDisabled,
    isDropdownOpen,
    toggleDropdown,
    onChange,
    className,
}: IGranularPermissionsDropdownProps) {
    const intl = useIntl();
    const trackEvent = useTelemetry();

    const [selectedPermission, setSelectedPermission] = useState<boolean>(workspace.isHierarchical);
    const handleOnSelect = (isHierarchical: boolean) => {
        onChange({ ...workspace, isHierarchical });
        trackPermissionChange(trackEvent, subjectType, isHierarchical);
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
                    "s-user-management-hierarchical-permission-button",
                    "gd-granular-permission-button",
                    "dropdown-button",
                    `gd-granular-hierarchical-permission-button-${stringUtils.simplifyText(workspace.id)}`,
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
                alignTo={`.gd-granular-hierarchical-permission-button-${stringUtils.simplifyText(
                    workspace.id,
                )}`}
            />
        </div>
    );
}

export const HierarchicalPermissionsDropdown = withBubble(Dropdown);
