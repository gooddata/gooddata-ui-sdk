// (C) 2023-2025 GoodData Corporation

import { useCallback, useMemo } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { getPermissionTitle } from "./locales.js";
import { QuestionMarkIcon } from "./QuestionMarkIcon.js";
import { type IPermissionsItem, type WorkspacePermission } from "../../types.js";

interface IPermissionItemProps {
    permission: IPermissionsItem;
    selectedPermission: WorkspacePermission;
    toggleDropdown: () => void;
    onSelect: (permission: WorkspacePermission) => void;
    bubbleTextId: string | undefined;
}

export function PermissionDropdownItem({
    permission,
    selectedPermission,
    toggleDropdown,
    onSelect,
    bubbleTextId,
}: IPermissionItemProps) {
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
}
