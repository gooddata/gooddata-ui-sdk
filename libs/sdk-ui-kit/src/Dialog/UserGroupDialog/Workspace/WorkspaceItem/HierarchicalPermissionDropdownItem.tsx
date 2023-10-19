// (C) 2022-2023 GoodData Corporation

import React, { useCallback } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";

import { withBubble } from "../../../../Bubble/index.js";
import { hierarchicalPermissionMessageLabels } from "../../../../locales.js";

interface IPermissionItemProps {
    hierarchicalPermission: boolean;
    selectedPermission: boolean;
    toggleDropdown: () => void;
    onSelect: (hierarchical: boolean) => void;
}

const SelectItem: React.FC<IPermissionItemProps> = ({
    hierarchicalPermission,
    selectedPermission,
    toggleDropdown,
    onSelect,
}) => {
    const intl = useIntl();

    const handleOnChange = useCallback(
        () => {
            toggleDropdown();
            onSelect(hierarchicalPermission);
        },
        [hierarchicalPermission, onSelect, toggleDropdown],
    );

    return (
        <div
            onClick={handleOnChange}
            className={cx(
                "gd-list-item",
                "gd-menu-item",
                "gd-granular-permission-select-item",
                "s-granular-permission-item",
                {
                    "is-selected": hierarchicalPermission === selectedPermission,
                },
            )}
        >
            <div>{intl.formatMessage(hierarchicalPermissionMessageLabels[hierarchicalPermission ? "enabled" : "disabled"])}</div>
        </div>
    );
};

export const PermissionDropdownItem = withBubble(SelectItem);
