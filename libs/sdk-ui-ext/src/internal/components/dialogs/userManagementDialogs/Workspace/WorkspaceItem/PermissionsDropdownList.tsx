// (C) 2023-2025 GoodData Corporation

import React, { useCallback } from "react";

import cx from "classnames";
import { defineMessages, useIntl } from "react-intl";

import { IAlignPoint, ItemsWrapper, Overlay, Separator } from "@gooddata/sdk-ui-kit";

import { workspacePermissionMessages } from "./locales.js";
import { PermissionDropdownItem } from "./PermissionDropdownItem.js";
import { IPermissionsItem, WorkspacePermission, WorkspacePermissionSubject } from "../../types.js";

const userGroupTooltipMessages = defineMessages({
    VIEW: { id: "userManagement.workspace.permissionGroup.view.tooltip" },
    VIEW_AND_SAVE_VIEWS: { id: "userManagement.workspace.permissionGroup.viewSaveViews.tooltip" },
    VIEW_AND_EXPORT: { id: "userManagement.workspace.permissionGroup.viewExport.tooltip" },
    VIEW_AND_EXPORT_AND_SAVE_VIEWS: {
        id: "userManagement.workspace.permissionGroup.viewExportSaveViews.tooltip",
    },
    ANALYZE: { id: "userManagement.workspace.permissionGroup.analyze.tooltip" },
    ANALYZE_AND_EXPORT: { id: "userManagement.workspace.permissionGroup.analyzeExport.tooltip" },
    MANAGE: { id: "userManagement.workspace.permissionGroup.manage.tooltip" },
});

const userTooltipMessages = defineMessages({
    VIEW: { id: "userManagement.workspace.permissionUser.view.tooltip" },
    VIEW_AND_SAVE_VIEWS: { id: "userManagement.workspace.permissionUser.viewSaveViews.tooltip" },
    VIEW_AND_EXPORT: { id: "userManagement.workspace.permissionUser.viewExport.tooltip" },
    VIEW_AND_EXPORT_AND_SAVE_VIEWS: {
        id: "userManagement.workspace.permissionUser.viewExportSaveViews.tooltip",
    },
    ANALYZE: { id: "userManagement.workspace.permissionUser.analyze.tooltip" },
    ANALYZE_AND_EXPORT: { id: "userManagement.workspace.permissionUser.analyzeExport.tooltip" },
    MANAGE: { id: "userManagement.workspace.permissionUser.manage.tooltip" },
});

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
            {intl.formatMessage(workspacePermissionMessages.remove)}
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
    const tooltipSource = subjectType === "user" ? userTooltipMessages : userGroupTooltipMessages;

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
