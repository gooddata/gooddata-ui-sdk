// (C) 2023 GoodData Corporation

import React, { useCallback } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";

import { hierarchicalPermissionMessages } from "./locales.js";
import { QuestionMarkIcon } from "./QuestionMarkIcon.js";

export interface IHierarchicalPermissionDropdownItemProps {
    isHierarchicalPermission: boolean;
    selectedPermission: boolean;
    toggleDropdown: () => void;
    onSelect: (hierarchical: boolean) => void;
    bubbleTextId: string;
}

export const HierarchicalPermissionDropdownItem: React.FC<IHierarchicalPermissionDropdownItemProps> = ({
    isHierarchicalPermission,
    selectedPermission,
    toggleDropdown,
    onSelect,
    bubbleTextId,
}) => {
    const intl = useIntl();

    const handleOnChange = useCallback(() => {
        toggleDropdown();
        onSelect(isHierarchicalPermission);
    }, [isHierarchicalPermission, onSelect, toggleDropdown]);

    return (
        <div
            onClick={handleOnChange}
            className={cx(
                "gd-list-item",
                "gd-menu-item",
                "gd-granular-permission-select-item",
                "gd-user-management-permission-item",
                "s-user-management-permission-item",
                {
                    "is-selected": isHierarchicalPermission === selectedPermission,
                },
            )}
        >
            <div>
                {intl.formatMessage(
                    isHierarchicalPermission
                        ? hierarchicalPermissionMessages.enabled
                        : hierarchicalPermissionMessages.disabled,
                )}
            </div>
            <div className="gd-user-management-help-icon-wrapper">
                <QuestionMarkIcon bubbleTextId={bubbleTextId} />
            </div>
        </div>
    );
};
