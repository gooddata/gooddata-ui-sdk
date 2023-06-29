// (C) 2022-2023 GoodData Corporation

import React, { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";
import { AccessGranularPermission } from "@gooddata/sdk-model";

import { GranteeItem, IGranularGrantee, IGranularPermissionTypeItem } from "../types.js";
import { withBubble } from "../../../../Bubble/index.js";
import { granularPermissionMessageLabels } from "../../../../locales.js";

interface IGranularPermissionItemProps {
    grantee: IGranularGrantee;
    permission: IGranularPermissionTypeItem;
    selectedPermission: AccessGranularPermission;
    toggleDropdown: () => void;
    onChange: (grantee: GranteeItem) => void;
    handleSetSelectedPermission: (permission: AccessGranularPermission) => void;
}

const GranularPermissionSelectItem: React.FC<IGranularPermissionItemProps> = ({
    permission,
    grantee,
    selectedPermission,
    toggleDropdown,
    handleSetSelectedPermission,
    onChange,
}) => {
    const intl = useIntl();

    const handleOnChange = useCallback(
        (permission: IGranularPermissionTypeItem) => {
            toggleDropdown();
            if (permission.id !== selectedPermission) {
                handleSetSelectedPermission(permission.id);
                onChange({ ...grantee, permissions: [permission.id] });
            }
        },
        [grantee, toggleDropdown, handleSetSelectedPermission, onChange, selectedPermission],
    );

    const isSelected = useMemo(() => permission.id === selectedPermission, [permission, selectedPermission]);

    return (
        <div
            onClick={() => {
                if (permission.enabled) {
                    handleOnChange(permission);
                }
            }}
            className={cx(
                "gd-list-item",
                "gd-menu-item",
                "gd-granular-permission-select-item",
                "s-granular-permission-item",
                {
                    "is-disabled": !permission.enabled,
                    "is-selected": isSelected,
                },
            )}
        >
            <div>{intl.formatMessage(granularPermissionMessageLabels[permission.id])}</div>
        </div>
    );
};

export const GranularPermissionSelectItemWithBubble = withBubble(GranularPermissionSelectItem);
