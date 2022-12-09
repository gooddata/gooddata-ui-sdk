// (C) 2022 GoodData Corporation

import React from "react";
import cx from "classnames";

import { GranteeItem, IGranularPermissionTypeItem } from "../types";

interface IGranularPermissionItemProps {
    permission: IGranularPermissionTypeItem;
    toggleDropdown: () => void;
    onChange: (grantee: GranteeItem) => void;
}

export const GranularPermissionItem: React.FC<IGranularPermissionItemProps> = ({
    permission,
    toggleDropdown,
}) => {
    const handleOnChange = () => {
        toggleDropdown();
        // TODO: change permission
        // onChange();
    };

    return (
        <div
            onClick={() => {
                if (!permission.disabled) {
                    handleOnChange();
                }
            }}
            className={cx("gd-list-item", "gd-menu-item", "gd-granular-permission-item", {
                "is-disabled": permission.disabled,
            })}
        >
            <div>{permission.title}</div>
        </div>
    );
};
