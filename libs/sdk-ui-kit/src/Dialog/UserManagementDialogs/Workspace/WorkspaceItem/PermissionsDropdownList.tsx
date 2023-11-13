// (C) 2023 GoodData Corporation

import React, { useCallback } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";

import { ItemsWrapper, Separator } from "../../../../List/index.js";
import { Overlay } from "../../../../Overlay/index.js";
import { IAlignPoint } from "../../../../typings/positioning.js";
import {
    userManagementWorkspacePermissionMessages,
    userGroupWorkspacePermissionTooltipMessages,
    userWorkspacePermissionTooltipMessages,
} from "../../../../locales.js";
import { IPermissionsItem, WorkspacePermission, WorkspacePermissionSubject } from "../../types.js";

import { PermissionDropdownItem } from "./PermissionDropdownItem.js";

interface IGranularPermissionsDropdownBodyProps {
    alignTo: string;
    subjectType: WorkspacePermissionSubject;
    selectedPermission: WorkspacePermission;
    items: IPermissionsItem[];
    isShowDropdown: boolean;
    toggleDropdown: () => void;
    onSelect: (permission: WorkspacePermission) => void;
    onDelete: () => void;
}

const overlayAlignPoints: IAlignPoint[] = [{ align: "br tr" }];

const RemoveItem: React.FC<{ disabled?: boolean; onClick: () => void }> = ({ disabled, onClick }) => {
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
            {intl.formatMessage(userManagementWorkspacePermissionMessages.remove)}
        </div>
    );
};

export const PermissionsDropdownList: React.FC<IGranularPermissionsDropdownBodyProps> = ({
    items,
    subjectType,
    alignTo,
    isShowDropdown,
    selectedPermission,
    toggleDropdown,
    onSelect,
    onDelete,
}) => {
    const tooltipSource =
        subjectType === "user"
            ? userWorkspacePermissionTooltipMessages
            : userGroupWorkspacePermissionTooltipMessages;

    const handleOnSelect = useCallback(
        (permission: WorkspacePermission) => {
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
            closeOnMouseDrag={true}
            closeOnOutsideClick={true}
            closeOnParentScroll={true}
            onClose={toggleDropdown}
        >
            <ItemsWrapper smallItemsSpacing={true}>
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
};
