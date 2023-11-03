// (C) 2023 GoodData Corporation

import React, { useCallback } from "react";

import { ItemsWrapper } from "../../../../List/index.js";
import { Overlay } from "../../../../Overlay/index.js";
import { IAlignPoint } from "../../../../typings/positioning.js";
import { userManagementHierarchicalPermissionTooltipMessages } from "../../../../locales.js";

import { HierarchicalPermissionDropdownItem } from "./HierarchicalPermissionDropdownItem.js";

interface IGranularPermissionsDropdownBodyProps {
    alignTo: string;
    selectedPermission: boolean;
    isShowDropdown: boolean;
    toggleDropdown: () => void;
    onSelect: (hierarchical: boolean) => void;
}

const overlayAlignPoints: IAlignPoint[] = [{ align: "br tr" }];

export const PermissionsDropdownList: React.FC<IGranularPermissionsDropdownBodyProps> = ({
    alignTo,
    isShowDropdown,
    selectedPermission,
    toggleDropdown,
    onSelect,
}) => {
    const handleOnSelect = useCallback(
        (hierarchical: boolean) => {
            onSelect(hierarchical);
            toggleDropdown();
        },
        [onSelect, toggleDropdown],
    );

    if (!isShowDropdown) {
        return null;
    }

    return (
        <Overlay
            key="GranularPermissionsSelect"
            alignTo={alignTo}
            alignPoints={overlayAlignPoints}
            className="s-user-management-permissions-overlay"
            closeOnMouseDrag={true}
            closeOnOutsideClick={true}
            closeOnParentScroll={true}
            onClose={toggleDropdown}
        >
            <ItemsWrapper smallItemsSpacing={true}>
                <HierarchicalPermissionDropdownItem
                    isHierarchicalPermission={false}
                    selectedPermission={selectedPermission}
                    toggleDropdown={toggleDropdown}
                    onSelect={handleOnSelect}
                    bubbleTextId={userManagementHierarchicalPermissionTooltipMessages.disabled.id}
                />
                <HierarchicalPermissionDropdownItem
                    isHierarchicalPermission={true}
                    selectedPermission={selectedPermission}
                    toggleDropdown={toggleDropdown}
                    onSelect={handleOnSelect}
                    bubbleTextId={userManagementHierarchicalPermissionTooltipMessages.enabled.id}
                />
            </ItemsWrapper>
        </Overlay>
    );
};
