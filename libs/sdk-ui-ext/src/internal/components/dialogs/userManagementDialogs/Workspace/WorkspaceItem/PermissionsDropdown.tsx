// (C) 2023-2025 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { withBubble } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

import { getPermissionTitle } from "./locales.js";
import { PermissionsDropdownList } from "./PermissionsDropdownList.js";
import { type TrackEventCallback, useTelemetry } from "../../TelemetryContext.js";
import {
    type IGrantedWorkspace,
    type IPermissionsItem,
    type WorkspacePermission,
    type WorkspacePermissionSubject,
} from "../../types.js";

const items: IPermissionsItem[] = [
    {
        id: "VIEW",
        enabled: true,
    },
    {
        id: "VIEW_AND_SAVE_VIEWS",
        enabled: true,
    },
    {
        id: "VIEW_AND_EXPORT",
        enabled: true,
    },
    {
        id: "VIEW_AND_EXPORT_AND_SAVE_VIEWS",
        enabled: true,
    },
    {
        id: "ANALYZE",
        enabled: true,
    },
    {
        id: "ANALYZE_AND_EXPORT",
        enabled: true,
    },
    {
        id: "MANAGE",
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
    areFilterViewsEnabled: boolean;
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
        case "VIEW_AND_SAVE_VIEWS":
            trackEvent(
                subjectType === "user"
                    ? "user-permission-changed-to-view-save-views"
                    : "group-permission-changed-to-view-save-views",
            );
            break;
        case "VIEW_AND_EXPORT":
            trackEvent(
                subjectType === "user"
                    ? "user-permission-changed-to-view-export"
                    : "group-permission-changed-to-view-export",
            );
            break;
        case "VIEW_AND_EXPORT_AND_SAVE_VIEWS":
            trackEvent(
                subjectType === "user"
                    ? "user-permission-changed-to-view-export-save-views"
                    : "group-permission-changed-to-view-export-save-views",
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

function Dropdown({
    workspace,
    subjectType,
    isDropdownDisabled,
    isDropdownOpen,
    toggleDropdown,
    onChange,
    onDelete,
    className,
    areFilterViewsEnabled,
}: IGranularPermissionsDropdownProps) {
    const intl = useIntl();
    const [selectedPermission, setSelectedPermission] = useState<WorkspacePermission>(
        workspace.permissions[0],
    );
    const trackEvent = useTelemetry();

    const handleOnSelect = (permission: WorkspacePermission) => {
        onChange({ ...workspace, permissions: [permission] });
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

    const buttonValue = intl.formatMessage(getPermissionTitle(selectedPermission));

    const enabledItems = useMemo(
        () =>
            items.filter(
                (item) =>
                    areFilterViewsEnabled ||
                    (item.id !== "VIEW_AND_SAVE_VIEWS" && item.id !== "VIEW_AND_EXPORT_AND_SAVE_VIEWS"),
            ),
        [areFilterViewsEnabled],
    );

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
                items={enabledItems}
                subjectType={subjectType}
                onSelect={handleOnSelect}
                onDelete={handleOnDelete}
                toggleDropdown={toggleDropdown}
                isShowDropdown={isDropdownOpen}
                alignTo={`.gd-granular-permission-button-${stringUtils.simplifyText(workspace.id)}`}
            />
        </div>
    );
}

export const PermissionsDropdown = withBubble(Dropdown);
