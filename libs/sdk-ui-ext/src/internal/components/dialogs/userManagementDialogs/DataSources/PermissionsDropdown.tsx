// (C) 2023-2025 GoodData Corporation

import React, { useCallback, useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { withBubble } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

import { dataSourcePermissionMessages } from "./locales.js";
import { PermissionsDropdownList } from "./PermissionsDropdownList.js";
import { TrackEventCallback, useTelemetry } from "../TelemetryContext.js";
import {
    DataSourcePermission,
    DataSourcePermissionSubject,
    IDataSourcePermissionsItem,
    IGrantedDataSource,
} from "../types.js";

const items: IDataSourcePermissionsItem[] = [
    {
        id: "MANAGE",
        enabled: true,
    },
    {
        id: "USE",
        enabled: true,
    },
];

interface IGranularPermissionsDropdownProps {
    dataSource: IGrantedDataSource;
    subjectType: DataSourcePermissionSubject;
    isDropdownDisabled?: boolean;
    isDropdownOpen: boolean;
    toggleDropdown: () => void;
    onChange: (dataSource: IGrantedDataSource) => void;
    onDelete: (dataSource: IGrantedDataSource) => void;
    className: string;
}

const trackPermissionChange = (
    trackEvent: TrackEventCallback,
    subjectType: DataSourcePermissionSubject,
    permission: DataSourcePermission,
) => {
    switch (permission) {
        case "USE":
            trackEvent(
                subjectType === "user"
                    ? "user-data-source-permission-changed-to-use"
                    : "group-data-source-permission-changed-to-use",
            );
            break;
        case "MANAGE":
            trackEvent(
                subjectType === "user"
                    ? "user-data-source-permission-changed-to-manage"
                    : "group-data-source-permission-changed-to-manage",
            );
            break;
    }
};

function Dropdown({
    dataSource,
    subjectType,
    isDropdownDisabled,
    isDropdownOpen,
    toggleDropdown,
    onChange,
    onDelete,
    className,
}: IGranularPermissionsDropdownProps) {
    const intl = useIntl();
    const [selectedPermission, setSelectedPermission] = useState<DataSourcePermission>(dataSource.permission);
    const trackEvent = useTelemetry();

    const handleOnSelect = (permission: DataSourcePermission) => {
        onChange({ ...dataSource, permission });
        trackPermissionChange(trackEvent, subjectType, permission);
        setSelectedPermission(permission);
    };

    const handleOnDelete = () => {
        onDelete(dataSource);
    };

    const handleClick = useCallback(() => {
        if (!isDropdownDisabled) {
            toggleDropdown();
        }
    }, [isDropdownDisabled, toggleDropdown]);

    const buttonValue = intl.formatMessage(dataSourcePermissionMessages[selectedPermission]);

    return (
        <div className={className}>
            <div
                className={cx(
                    "s-user-management-permission-button",
                    "gd-granular-permission-button",
                    "dropdown-button",
                    `gd-granular-permission-button-${stringUtils.simplifyText(dataSource.id)}`,
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
                alignTo={`.gd-granular-permission-button-${stringUtils.simplifyText(dataSource.id)}`}
            />
        </div>
    );
}

export const PermissionsDropdown = withBubble(Dropdown);
