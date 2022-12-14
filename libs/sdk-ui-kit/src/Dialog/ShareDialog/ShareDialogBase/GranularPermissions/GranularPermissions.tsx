// (C) 2022 GoodData Corporation

import React from "react";
import { FormattedMessage, IntlShape, useIntl } from "react-intl";
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
}

const overlayAlignPoints: IAlignPoint[] = [{ align: "br tr" }];

const getPermissionTypeItems = (
    intl: IntlShape,
    dashboardPermissions: IDashboardPermissions,
): IGranularPermissionTypeItem[] => {
    const permissionTypeItems: IGranularPermissionTypeItem[] = [];

    // EDIT - can change all
    // SHARE - can only change <= SHARE
    // VIEW - can only change <= VIEW

    permissionTypeItems.push(
        {
            id: "edit",
            title: intl.formatMessage({ id: "shareDialog.share.granular.grantee.permission.edit" }),
            disabled: dashboardPermissions.canEditDashboard ? false : true,
        },
        {
            id: "share",
            title: intl.formatMessage({ id: "shareDialog.share.granular.grantee.permission.share" }),
            disabled: dashboardPermissions.canShareDashboard ? false : true,
        },
        {
            id: "view",
            title: intl.formatMessage({ id: "shareDialog.share.granular.grantee.permission.view" }),
            disabled: dashboardPermissions.canViewDashboard ? false : true,
        },
    );

    return permissionTypeItems;
};

export const GranularPermissions: React.FC<IGranularPermissionsProps> = ({
    alignTo,
    isShowDropdown,
    dashboardPermissions,
    toggleDropdown,
    onChange,
}) => {
    const intl = useIntl();
    const permissions = getPermissionTypeItems(intl, dashboardPermissions);

    if (!isShowDropdown) {
        return null;
    }

    const handleOnDelete = () => {
        toggleDropdown();
        // Handle revoke access
        // onDelete(grantee);
    };

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
                            key={permission.id}
                            permission={permission}
                            toggleDropdown={toggleDropdown}
                            onChange={onChange}
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
