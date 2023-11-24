// (C) 2023 GoodData Corporation

import React from "react";
import { ICatalogAttributeHierarchy } from "@gooddata/sdk-model";
import { DropdownList } from "@gooddata/sdk-ui-kit";

import { AttributeHierarchyListItem } from "./AttributeHierarchyListItem.js";
import AttributeHierarchyListFooter from "./AttributeHierarchyListFooter.js";

/**
 * @internal
 */
export interface IAttributeHierarchyItem {
    isDisabled: boolean;
    hierarchy: ICatalogAttributeHierarchy;
}

/**
 * @internal
 */
export interface IAttributeHierarchyListProps {
    hierarchies: IAttributeHierarchyItem[];
    onSelect: (selectedDashboard: ICatalogAttributeHierarchy) => void;
    onOpenAttributeHierarchyDialog: (attributeHierarchy?: ICatalogAttributeHierarchy) => void;
    closeDropdown: () => void;
}

const ITEM_HEIGHT = 28;
const DROPDOWN_BODY_WIDTH = 187;
export const AttributeHierarchyList: React.FC<IAttributeHierarchyListProps> = ({
    hierarchies,
    onSelect,
    closeDropdown,
    onOpenAttributeHierarchyDialog,
}) => {
    const onClick = (item: IAttributeHierarchyItem) => {
        if (!item.isDisabled) {
            onSelect(item.hierarchy);
        }
    };

    const handleFooterButtonClick = () => {
        onOpenAttributeHierarchyDialog();
        closeDropdown();
    };

    return (
        <DropdownList
            className="hierarchies-dropdown-body s-hierarchies-dropdown-body"
            width={DROPDOWN_BODY_WIDTH}
            itemHeight={ITEM_HEIGHT}
            showSearch={false}
            items={hierarchies}
            footer={() => <AttributeHierarchyListFooter onClick={handleFooterButtonClick} />}
            renderItem={({ item }) => {
                return (
                    <AttributeHierarchyListItem
                        item={item.hierarchy}
                        isDisabled={item.isDisabled}
                        onEdit={onOpenAttributeHierarchyDialog}
                        onClick={() => {
                            onClick(item);
                        }}
                    />
                );
            }}
        />
    );
};
