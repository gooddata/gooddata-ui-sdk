// (C) 2022-2023 GoodData Corporation

import React, { useCallback } from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";

import { ItemsWrapper, Separator } from "../../../../List/index.js";
import { Overlay } from "../../../../Overlay/index.js";
import { IAlignPoint } from "../../../../typings/positioning.js";
import { workspacePermissionMessageLabels } from "../../../../locales.js";
import { IPermissionsItem, WorkspacePermission } from "../../types.js";

import { PermissionDropdownItem } from "./PermissionDropdownItem.js";

interface IGranularPermissionsDropdownBodyProps {
    alignTo: string;
    selectedPermission: WorkspacePermission;
    items: IPermissionsItem[];
    isShowDropdown: boolean;
    toggleDropdown: () => void;
    onSelect: (permission: WorkspacePermission) => void;
    onDelete: () => void;
}

const overlayAlignPoints: IAlignPoint[] = [{ align: "br tr" }];

const RemoveItem: React.FC<{ disabled?: boolean; onClick: () => void }> = ({
    disabled,
    onClick,
}) => {
    const className = cx("gd-list-item gd-menu-item", "s-granular-permission-remove", {
        "is-disabled": disabled,
    });

    return (
        <div className={className} onClick={onClick}>
            <FormattedMessage id={workspacePermissionMessageLabels.remove.id} />
        </div>
    );
};

export const PermissionsDropdownList: React.FC<IGranularPermissionsDropdownBodyProps> = ({
    items,
    alignTo,
    isShowDropdown,
    selectedPermission,
    toggleDropdown,
    onSelect,
    onDelete,
}) => {
    const handleOnSelect = useCallback(
        (permission: WorkspacePermission) => {
            onSelect(permission);
            toggleDropdown();
        },
        [onSelect, toggleDropdown],
    );

    const handleOnDelete = useCallback(
        () => {
            onDelete();
            toggleDropdown();
        },
        [onDelete, toggleDropdown],
    );

    if (!isShowDropdown) {
        return null;
    }

    return (
        <Overlay
            key="GranularPermissionsSelect"
            alignTo={alignTo}
            alignPoints={overlayAlignPoints}
            className="s-granular-permissions-overlay"
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
                            bubbleTextId={permissionItem.tooltip}
                        />
                    );
                })}
                <Separator />
                <RemoveItem onClick={handleOnDelete} />
            </ItemsWrapper>
        </Overlay>
    );
};
