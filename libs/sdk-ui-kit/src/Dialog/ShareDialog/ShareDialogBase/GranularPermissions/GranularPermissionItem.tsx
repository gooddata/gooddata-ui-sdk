// (C) 2022 GoodData Corporation

import React from "react";
import cx from "classnames";

import { GranteeItem, IGranularGrantee, IGranularPermissionTypeItem } from "../types";
import { useIntl } from "react-intl";

interface IGranularPermissionItemProps {
    grantee: IGranularGrantee;
    permission: IGranularPermissionTypeItem;
    toggleDropdown: () => void;
    onChange: (grantee: GranteeItem) => void;
    handleSetSelectedPermission: (permission: string) => void;
}

export const GranularPermissionItem: React.FC<IGranularPermissionItemProps> = ({
    grantee,
    permission,
    toggleDropdown,
    onChange,
    handleSetSelectedPermission,
}) => {
    const intl = useIntl();

    const handleOnChange = (permission: IGranularPermissionTypeItem) => {
        toggleDropdown();
        handleSetSelectedPermission(permission.title);
        onChange({ ...grantee, permissions: [permission.id] });
    };

    return (
        <div
            onClick={() => {
                if (!permission.disabled) {
                    handleOnChange(permission);
                }
            }}
            className={cx("gd-list-item", "gd-menu-item", "gd-granular-permission-item", {
                "is-disabled": permission.disabled,
            })}
        >
            <div>{intl.formatMessage({ id: permission.title })}</div>
        </div>
    );
};
