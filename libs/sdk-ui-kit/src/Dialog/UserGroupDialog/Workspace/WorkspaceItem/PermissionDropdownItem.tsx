// (C) 2022-2023 GoodData Corporation

import React, { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";

import { withBubble } from "../../../../Bubble/index.js";
import { workspacePermissionMessageLabels } from "../../../../locales.js";
import { IPermissionsItem, WorkspacePermission } from "../../types.js";

interface IPermissionItemProps {
    permission: IPermissionsItem;
    selectedPermission: WorkspacePermission;
    toggleDropdown: () => void;
    onSelect: (permission: WorkspacePermission) => void;
}

const SelectItem: React.FC<IPermissionItemProps> = ({
    permission,
    selectedPermission,
    toggleDropdown,
    onSelect,
}) => {
    const intl = useIntl();

    const handleOnChange = useCallback(
        () => {
            if (permission.enabled) {
                toggleDropdown();
                onSelect(permission.id);
            }
        },
        [permission, onSelect, toggleDropdown],
    );

    const isSelected = useMemo(() => permission.id === selectedPermission, [permission, selectedPermission]);

    return (
        <div
            onClick={handleOnChange}
            className={cx(
                "gd-list-item",
                "gd-menu-item",
                "gd-granular-permission-select-item",
                "s-granular-permission-item",
                {
                    "is-disabled": !permission.enabled,
                    "is-selected": isSelected,
                },
            )}
        >
            <div>{intl.formatMessage(workspacePermissionMessageLabels[permission.id])}</div>
        </div>
    );
};

export const PermissionDropdownItem = withBubble(SelectItem);
