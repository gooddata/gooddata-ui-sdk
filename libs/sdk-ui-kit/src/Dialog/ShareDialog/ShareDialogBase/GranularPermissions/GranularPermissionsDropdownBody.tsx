// (C) 2022-2023 GoodData Corporation

import React, { useCallback, useMemo } from "react";
import { FormattedMessage } from "react-intl";
import { AccessGranularPermission } from "@gooddata/sdk-model";

import { GranularPermissionItem } from "./GranularPermissionItem";

import { GranteeItem, IGranularGrantee, IGranularPermissionTypeItem } from "../types";
import { ItemsWrapper, Separator } from "../../../../List";
import { Overlay } from "../../../../Overlay";
import { IAlignPoint } from "../../../../typings/positioning";
import { CurrentUserPermissions } from "../../types";
import { granularPermissionMessageLabels } from "../../../../locales";

interface IGranularPermissionsDropdownBodyProps {
    alignTo: string;
    grantee: IGranularGrantee;
    currentUserPermissions: CurrentUserPermissions;
    isShowDropdown: boolean;
    selectedPermission: string;
    toggleDropdown(): void;
    onChange: (grantee: GranteeItem) => void;
    onDelete: (grantee: GranteeItem) => void;
    handleSetSelectedPermission: (permission: AccessGranularPermission) => void;
}

const overlayAlignPoints: IAlignPoint[] = [{ align: "bl tl" }];

const getPermissionTypeItems = (
    currentUserPermissions: CurrentUserPermissions,
): IGranularPermissionTypeItem[] => {
    return [
        {
            id: "EDIT",
            title: granularPermissionMessageLabels.EDIT.id,
            disabled: currentUserPermissions.canEditDashboard ? false : true,
        },
        {
            id: "SHARE",
            title: granularPermissionMessageLabels.SHARE.id,
            disabled: currentUserPermissions.canShareDashboard ? false : true,
        },
        {
            id: "VIEW",
            title: granularPermissionMessageLabels.VIEW.id,
            disabled: currentUserPermissions.canViewDashboard ? false : true,
        },
    ];
};

export const GranularPermissionsDropdownBody: React.FC<IGranularPermissionsDropdownBodyProps> = ({
    grantee,
    alignTo,
    isShowDropdown,
    currentUserPermissions,
    selectedPermission,
    toggleDropdown,
    onChange,
    onDelete,
    handleSetSelectedPermission,
}) => {
    const permissions = useMemo(
        () => getPermissionTypeItems(currentUserPermissions),
        [currentUserPermissions],
    );

    const handleOnDelete = useCallback(() => {
        const changedGrantee: GranteeItem = {
            ...grantee,
            permissions: [],
            inheritedPermissions: [],
        };
        onDelete(changedGrantee);
        toggleDropdown();
    }, [grantee, onDelete, toggleDropdown]);

    if (!isShowDropdown) {
        return null;
    }

    return (
        <Overlay
            key="GranularPermissionsSelect"
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
                            selectedPermission={selectedPermission}
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
