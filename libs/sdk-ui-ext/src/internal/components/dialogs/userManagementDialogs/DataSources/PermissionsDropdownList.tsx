// (C) 2023-2025 GoodData Corporation

import { useCallback } from "react";

import cx from "classnames";
import { defineMessages, useIntl } from "react-intl";

import { IAlignPoint, ItemsWrapper, Overlay, Separator } from "@gooddata/sdk-ui-kit";

import { dataSourcePermissionMessages } from "./locales.js";
import { PermissionDropdownItem } from "./PermissionsDropdownItem.js";
import { DataSourcePermission, DataSourcePermissionSubject, IDataSourcePermissionsItem } from "../types.js";

const userGroupTooltipMessages = defineMessages({
    USE: { id: "userManagement.dataSources.permissionGroup.use.tooltip" },
    MANAGE: { id: "userManagement.dataSources.permissionGroup.manage.tooltip" },
});

const userTooltipMessages = defineMessages({
    USE: { id: "userManagement.dataSources.permissionUser.use.tooltip" },
    MANAGE: { id: "userManagement.dataSources.permissionUser.manage.tooltip" },
});

interface IGranularPermissionsDropdownBodyProps {
    alignTo: string;
    subjectType: DataSourcePermissionSubject;
    selectedPermission: DataSourcePermission;
    items: IDataSourcePermissionsItem[];
    isShowDropdown: boolean;
    toggleDropdown: () => void;
    onSelect: (permission: DataSourcePermission) => void;
    onDelete: () => void;
}

const overlayAlignPoints: IAlignPoint[] = [{ align: "br tr" }];

function RemoveItem({ disabled, onClick }: { disabled?: boolean; onClick: () => void }) {
    const intl = useIntl();
    const className = cx(
        "gd-list-item gd-menu-item gd-menu-item-remove",
        "s-user-management-permission-remove",
        {
            "is-disabled": disabled,
        },
    );

    return (
        <div className={className} onClick={onClick}>
            {intl.formatMessage(dataSourcePermissionMessages.remove)}
        </div>
    );
}

export function PermissionsDropdownList({
    items,
    subjectType,
    alignTo,
    isShowDropdown,
    selectedPermission,
    toggleDropdown,
    onSelect,
    onDelete,
}: IGranularPermissionsDropdownBodyProps) {
    const tooltipSource = subjectType === "user" ? userTooltipMessages : userGroupTooltipMessages;

    const handleOnSelect = useCallback(
        (permission: DataSourcePermission) => {
            onSelect(permission);
            toggleDropdown();
        },
        [onSelect, toggleDropdown],
    );

    const handleOnDelete = useCallback(() => {
        onDelete();
        toggleDropdown();
    }, [onDelete, toggleDropdown]);

    if (!isShowDropdown) {
        return null;
    }

    return (
        <Overlay
            key="GranularPermissionsSelect"
            alignTo={alignTo}
            alignPoints={overlayAlignPoints}
            className="s-user-management-permissions-overlay"
            closeOnMouseDrag
            closeOnOutsideClick
            closeOnParentScroll
            onClose={toggleDropdown}
        >
            <ItemsWrapper smallItemsSpacing>
                {items.map((permissionItem) => {
                    return (
                        <PermissionDropdownItem
                            key={permissionItem.id}
                            permission={permissionItem}
                            selectedPermission={selectedPermission}
                            toggleDropdown={toggleDropdown}
                            onSelect={handleOnSelect}
                            bubbleTextId={tooltipSource[permissionItem.id].id}
                        />
                    );
                })}
                <Separator />
                <RemoveItem onClick={handleOnDelete} />
            </ItemsWrapper>
        </Overlay>
    );
}
