// (C) 2023-2025 GoodData Corporation

import { useCallback } from "react";

import { defineMessages } from "react-intl";

import { IAlignPoint, ItemsWrapper, Overlay } from "@gooddata/sdk-ui-kit";

import { HierarchicalPermissionDropdownItem } from "./HierarchicalPermissionDropdownItem.js";

const messages = defineMessages({
    enabled: { id: "userManagement.workspace.hierarchicalPermission.yes.tooltip" },
    disabled: { id: "userManagement.workspace.hierarchicalPermission.no.tooltip" },
});

interface IGranularPermissionsDropdownBodyProps {
    alignTo: string;
    selectedPermission: boolean;
    isShowDropdown: boolean;
    toggleDropdown: () => void;
    onSelect: (hierarchical: boolean) => void;
}

const overlayAlignPoints: IAlignPoint[] = [{ align: "br tr" }];

export function PermissionsDropdownList({
    alignTo,
    isShowDropdown,
    selectedPermission,
    toggleDropdown,
    onSelect,
}: IGranularPermissionsDropdownBodyProps) {
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
            closeOnMouseDrag
            closeOnOutsideClick
            closeOnParentScroll
            onClose={toggleDropdown}
        >
            <ItemsWrapper smallItemsSpacing>
                <HierarchicalPermissionDropdownItem
                    isHierarchicalPermission={false}
                    selectedPermission={selectedPermission}
                    toggleDropdown={toggleDropdown}
                    onSelect={handleOnSelect}
                    bubbleTextId={messages.disabled.id}
                />
                <HierarchicalPermissionDropdownItem
                    isHierarchicalPermission
                    selectedPermission={selectedPermission}
                    toggleDropdown={toggleDropdown}
                    onSelect={handleOnSelect}
                    bubbleTextId={messages.enabled.id}
                />
            </ItemsWrapper>
        </Overlay>
    );
}
