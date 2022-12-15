// (C) 2022 GoodData Corporation

import React, { useCallback } from "react";
import { useIntl } from "react-intl";

import cx from "classnames";

import { GranteeItem, IGranularGrantee, IGranularPermissionTypeItem } from "../types";

import { Bubble, BubbleHoverTrigger } from "../../../../Bubble";
import { IAlignPoint } from "../../../../typings/positioning";

const alignPoints: IAlignPoint[] = [{ align: "cr cl" }];

interface IGranularPermissionItemProps {
    grantee: IGranularGrantee;
    permission: IGranularPermissionTypeItem;
    toggleDropdown: () => void;
    onChange: (grantee: GranteeItem) => void;
    handleSetSelectedPermission: (permission: string) => void;
}

const DropdownItem: React.FC<IGranularPermissionItemProps> = ({
    permission,
    grantee,
    toggleDropdown,
    handleSetSelectedPermission,
    onChange,
}) => {
    const intl = useIntl();

    const handleOnChange = useCallback(
        (permission: IGranularPermissionTypeItem) => {
            toggleDropdown();
            handleSetSelectedPermission(permission.title);
            onChange({ ...grantee, permissions: [permission.id] });
        },
        [permission],
    );

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

export const GranularPermissionItem: React.FC<IGranularPermissionItemProps> = (props) => {
    const {
        permission: { disabled },
    } = props;

    if (!disabled) {
        return <DropdownItem {...props} />;
    }

    return (
        <BubbleHoverTrigger>
            <DropdownItem {...props} />
            {/* TODO: Choose correct toolip to display based on permissiones hierarchy */}
            <Bubble alignPoints={alignPoints}>
                <div> disabled tooltip </div>
            </Bubble>
        </BubbleHoverTrigger>
    );
};
