// (C) 2022-2023 GoodData Corporation

import React, { useCallback, useMemo } from "react";
import { FormattedMessage } from "react-intl";
import { AccessGranularPermission } from "@gooddata/sdk-model";

import { GranularPermissionItem } from "./GranularPermissionItem";

import { GranteeItem, IGranularGrantee } from "../types";
import { ItemsWrapper, Separator } from "../../../../List";
import { Overlay } from "../../../../Overlay";
import { IAlignPoint } from "../../../../typings/positioning";
import { CurrentUserPermissions } from "../../types";
import { getPermissionTypeItems } from "./permissionsLogic";

interface IGranularPermissionsDropdownBodyProps {
    alignTo: string;
    grantee: IGranularGrantee;
    currentUserPermissions: CurrentUserPermissions;
    isDashboardLocked: boolean;
    isShowDropdown: boolean;
    selectedPermission: string;
    toggleDropdown(): void;
    onChange: (grantee: GranteeItem) => void;
    onDelete: (grantee: GranteeItem) => void;
    handleSetSelectedPermission: (permission: AccessGranularPermission) => void;
}

const overlayAlignPoints: IAlignPoint[] = [{ align: "bl tl" }];

export const GranularPermissionsDropdownBody: React.FC<IGranularPermissionsDropdownBodyProps> = ({
    grantee,
    alignTo,
    isShowDropdown,
    currentUserPermissions,
    isDashboardLocked,
    selectedPermission,
    toggleDropdown,
    onChange,
    onDelete,
    handleSetSelectedPermission,
}) => {
    const permissionsItems = useMemo(
        () => getPermissionTypeItems(currentUserPermissions, isDashboardLocked),
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
                {permissionsItems.map((permissionItem) => {
                    return (
                        !permissionItem.hidden && (
                            <GranularPermissionItem
                                grantee={grantee}
                                key={permissionItem.id}
                                permission={permissionItem}
                                selectedPermission={selectedPermission}
                                toggleDropdown={toggleDropdown}
                                onChange={onChange}
                                handleSetSelectedPermission={handleSetSelectedPermission}
                            />
                        )
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
