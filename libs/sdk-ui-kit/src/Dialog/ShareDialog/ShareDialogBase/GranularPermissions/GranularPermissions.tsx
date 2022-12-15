// (C) 2022 GoodData Corporation

import React, { useCallback } from "react";
import { FormattedMessage } from "react-intl";
import { IDashboardPermissions } from "@gooddata/sdk-model";

import { GranularPermissionItem } from "./GranularPermissionItem";

import { GranteeItem, IGranularGrantee, IGranularPermissionTypeItem } from "../types";

import { ItemsWrapper, Separator } from "../../../../List";
import { Overlay } from "../../../../Overlay";
import { IAlignPoint } from "../../../../typings/positioning";

interface IGranularPermissionsProps {
    alignTo: string;
    grantee: IGranularGrantee;
    dashboardPermissions: IDashboardPermissions;
    isShowDropdown: boolean;
    toggleDropdown(): void;
    onChange: (grantee: GranteeItem) => void;
    onDelete: (grantee: GranteeItem) => void;
    handleSetSelectedPermission: (permission: string) => void;
}

const overlayAlignPoints: IAlignPoint[] = [{ align: "bl tl" }];

const getPermissionTypeItems = (
    dashboardPermissions: IDashboardPermissions,
): IGranularPermissionTypeItem[] => {
    const permissionTypeItems: IGranularPermissionTypeItem[] = [];

    permissionTypeItems.push(
        {
            id: "EDIT",
            title: "shareDialog.share.granular.grantee.permission.edit",
            disabled: dashboardPermissions.canEditDashboard ? false : true,
        },
        {
            id: "SHARE",
            title: "shareDialog.share.granular.grantee.permission.share",
            disabled: dashboardPermissions.canShareDashboard ? false : true,
        },
        {
            id: "VIEW",
            title: "shareDialog.share.granular.grantee.permission.view",
            disabled: dashboardPermissions.canViewDashboard ? false : true,
        },
    );

    return permissionTypeItems;
};

export const GranularPermissions: React.FC<IGranularPermissionsProps> = ({
    grantee,
    alignTo,
    isShowDropdown,
    dashboardPermissions,
    toggleDropdown,
    onChange,
    onDelete,
    handleSetSelectedPermission,
}) => {
    const permissions = getPermissionTypeItems(dashboardPermissions);

    if (!isShowDropdown) {
        return null;
    }

    const handleOnDelete = useCallback(() => {
        const changedGrantee: GranteeItem = {
            ...grantee,
            permissions: [],
            inheritedPermissions: [],
        };
        onDelete(changedGrantee);
        toggleDropdown();
    }, [grantee, onDelete, toggleDropdown]);

    return (
        <Overlay
            key="GranularPermissions"
            alignTo={`.${alignTo}`}
            alignPoints={overlayAlignPoints}
            className="gd-granular-permissions-overlay"
            closeOnMouseDrag={true}
            closeOnOutsideClick={true}
            closeOnParentScroll={true}
            onClose={toggleDropdown}
        >
            <ItemsWrapper smallItemsSpacing={true}>
                {permissions.map((permission) => {
                    return (
                        <GranularPermissionItem
                            grantee={grantee}
                            key={permission.id}
                            permission={permission}
                            toggleDropdown={toggleDropdown}
                            onChange={onChange}
                            handleSetSelectedPermission={handleSetSelectedPermission}
                        />
                    );
                })}
                <Separator />
                <div className="gd-list-item gd-menu-item" onClick={handleOnDelete}>
                    <FormattedMessage id="shareDialog.share.granular.grantee.permission.remove" />
                </div>
            </ItemsWrapper>
        </Overlay>
    );
};
