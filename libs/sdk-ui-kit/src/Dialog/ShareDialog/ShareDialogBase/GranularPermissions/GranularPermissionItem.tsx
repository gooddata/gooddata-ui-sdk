// (C) 2022-2025 GoodData Corporation

import { forwardRef, useCallback, useMemo } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { type AccessGranularPermission } from "@gooddata/sdk-model";

import { withBubble } from "../../../../Bubble/withBubble.js";
import { granularPermissionMessageLabels } from "../../../../locales.js";
import { type GranteeItem, type IGranularGrantee, type IGranularPermissionTypeItem } from "../types.js";

interface IGranularPermissionItemProps {
    grantee: IGranularGrantee;
    permission: IGranularPermissionTypeItem;
    selectedPermission: AccessGranularPermission;
    toggleDropdown: () => void;
    onChange: (grantee: GranteeItem) => void;
    handleSetSelectedPermission: (permission: AccessGranularPermission) => void;
}

const GranularPermissionSelectItem = forwardRef<HTMLDivElement, IGranularPermissionItemProps>(
    (
        { permission, grantee, selectedPermission, toggleDropdown, handleSetSelectedPermission, onChange },
        ref,
    ) => {
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

        const isSelected = useMemo(
            () => permission.id === selectedPermission,
            [permission, selectedPermission],
        );

        return (
            <div
                id={permission.id}
                ref={ref}
                onClick={() => {
                    if (permission.enabled) {
                        handleOnChange(permission);
                    }
                }}
                tabIndex={permission.enabled ? 0 : -1}
                role="option"
                aria-selected={isSelected}
                aria-disabled={!permission.enabled}
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
    },
);

GranularPermissionSelectItem.displayName = "GranularPermissionSelectItem";

export const GranularPermissionSelectItemWithBubble = withBubble(GranularPermissionSelectItem);
