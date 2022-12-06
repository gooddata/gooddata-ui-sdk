// (C) 2022 GoodData Corporation

import React from "react";
import { FormattedMessage, IntlShape, useIntl } from "react-intl";

import { GranularPermissionItem } from "./GranularPermissionItem";

import { GranteeItem, IGranularPermissionTypeItem } from "../types";

import { ItemsWrapper, Separator } from "../../../../List";
import { Overlay } from "../../../../Overlay";
import { IAlignPoint } from "../../../../typings/positioning";

interface IGranularPermissionsProps {
    alignTo: string;
    grantee: GranteeItem;
    isShowDropdown: boolean;
    toggleDropdown(): void;
    onChange: (grantee: GranteeItem) => void;
    onDelete: (grantee: GranteeItem) => void;
}

const overlayAlignPoints: IAlignPoint[] = [{ align: "br tr" }];

const getPermissionTypeItems = (intl: IntlShape): IGranularPermissionTypeItem[] => {
    const permissionTypeItems: IGranularPermissionTypeItem[] = [];
    permissionTypeItems.push(
        {
            id: "edit",
            title: intl.formatMessage({ id: "shareDialog.share.granular.grantee.permission.edit" }),
            // TODO: update with proper logic
            disabled: false,
        },
        {
            id: "share",
            title: intl.formatMessage({ id: "shareDialog.share.granular.grantee.permission.share" }),
            // TODO: update with proper logic
            disabled: true,
        },
        {
            id: "view",
            title: intl.formatMessage({ id: "shareDialog.share.granular.grantee.permission.view" }),
            // TODO: update with proper logic
            disabled: true,
        },
    );

    return permissionTypeItems;
};

export const GranularPermissions: React.FC<IGranularPermissionsProps> = ({
    alignTo,
    isShowDropdown,
    toggleDropdown,
    onChange,
}) => {
    const intl = useIntl();
    const permissions = getPermissionTypeItems(intl);

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
