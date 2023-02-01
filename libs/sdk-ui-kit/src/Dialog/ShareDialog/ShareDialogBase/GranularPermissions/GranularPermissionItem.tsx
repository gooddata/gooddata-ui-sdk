// (C) 2022-2023 GoodData Corporation

import React, { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";
import { AccessGranularPermission } from "@gooddata/sdk-model";

import { GranteeItem, IGranularGrantee, IGranularPermissionTypeItem } from "../types";
import { IAlignPoint } from "../../../../typings/positioning";
import { granularPermissionMessageLabels } from "../../../../locales";
import { withBubble } from "../../../../Bubble";

const alignPoints: IAlignPoint[] = [{ align: "cr cl" }];

interface IGranularPermissionItemProps {
    grantee: IGranularGrantee;
    permission: IGranularPermissionTypeItem;
    selectedPermission: string;
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
            handleSetSelectedPermission(permission.id);
            onChange({ ...grantee, permissions: [permission.id] });
        },
        [grantee, toggleDropdown, handleSetSelectedPermission, onChange],
    );

    const isSelected = useMemo(() => permission.id === selectedPermission, [permission, selectedPermission]);

    return (
        <div
            onClick={() => {
                if (!permission.disabled) {
                    handleOnChange(permission);
                }
            }}
            className={cx("gd-list-item", "gd-menu-item", "gd-granular-permission-select-item", {
                "is-disabled": permission.disabled,
                "is-selected": isSelected,
            })}
        >
            <div>{intl.formatMessage({ id: granularPermissionMessageLabels[permission.id].id })}</div>
        </div>
    );
};

const GranularPermissionSelectItemWithBubble = withBubble(GranularPermissionSelectItem);

export const GranularPermissionItem: React.FC<IGranularPermissionItemProps> = (props) => {
    const {
        permission: { disabled },
    } = props;

    if (!disabled) {
        return <GranularPermissionSelectItem {...props} />;
    }

    return (
        <GranularPermissionSelectItemWithBubble {...props} alignPoints={alignPoints} bubbleText={"test"} />
    );
};
