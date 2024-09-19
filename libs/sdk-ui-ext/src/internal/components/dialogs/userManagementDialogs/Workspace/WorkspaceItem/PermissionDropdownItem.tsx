// (C) 2023-2024 GoodData Corporation

import React, { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";

import { IPermissionsItem, WorkspacePermission } from "../../types.js";

import { getPermissionTitle } from "./locales.js";
import { QuestionMarkIcon } from "./QuestionMarkIcon.js";

interface IPermissionItemProps {
    permission: IPermissionsItem;
    selectedPermission: WorkspacePermission;
    toggleDropdown: () => void;
    onSelect: (permission: WorkspacePermission) => void;
    bubbleTextId: string;
}

export const PermissionDropdownItem: React.FC<IPermissionItemProps> = ({
    permission,
    selectedPermission,
    toggleDropdown,
    onSelect,
    bubbleTextId,
}) => {
    const intl = useIntl();

    const handleOnChange = useCallback(() => {
        if (permission.enabled) {
            toggleDropdown();
            onSelect(permission.id);
        }
    }, [permission, onSelect, toggleDropdown]);

    const isSelected = useMemo(() => permission.id === selectedPermission, [permission, selectedPermission]);

    return (
        <div
            onClick={handleOnChange}
            className={cx(
                "gd-list-item",
                "gd-menu-item",
                "gd-granular-permission-select-item",
                "gd-user-management-permission-item",
                "s-user-management-permission-item",
                {
                    "is-disabled": !permission.enabled,
                    "is-selected": isSelected,
                },
            )}
        >
            <div>{intl.formatMessage(getPermissionTitle(permission.id))}</div>
            <div className="gd-user-management-help-icon-wrapper">
                <QuestionMarkIcon bubbleTextId={bubbleTextId} />
            </div>
        </div>
    );
};
