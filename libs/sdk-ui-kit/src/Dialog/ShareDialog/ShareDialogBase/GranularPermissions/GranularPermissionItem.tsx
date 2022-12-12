// (C) 2022 GoodData Corporation

import React from "react";
import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { GranteeItem, IGranularPermissionTypeItem } from "../types";

import { Bubble, BubbleHoverTrigger } from "../../../../Bubble";
import { IAlignPoint } from "../../../../typings/positioning";

const alignPoints: IAlignPoint[] = [{ align: "cr cl" }];

interface IGranularPermissionItemProps {
    permission: IGranularPermissionTypeItem;
    toggleDropdown: () => void;
    onChange: (grantee: GranteeItem) => void;
}

const DropdownItem: React.FC<IGranularPermissionItemProps> = ({ permission, toggleDropdown }) => {
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
                <FormattedMessage id="shareDialog.share.granular.permissions.item.tooltip" />
            </Bubble>
        </BubbleHoverTrigger>
    );
};
