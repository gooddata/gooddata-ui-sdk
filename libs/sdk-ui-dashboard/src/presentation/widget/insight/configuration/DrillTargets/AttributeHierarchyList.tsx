// (C) 2023 GoodData Corporation

import React from "react";

import { DropdownList } from "@gooddata/sdk-ui-kit";

import { AttributeHierarchyListItem } from "./AttributeHierarchyListItem.js";
import { ICatalogAttributeHierarchy } from "@gooddata/sdk-model";

/**
 * @internal
 */
export interface IAttributeHierarchyListProps {
    onSelect: (selectedDashboard: ICatalogAttributeHierarchy) => void;
    hierarchies: ICatalogAttributeHierarchy[];
}

const ITEM_HEIGHT = 28;
const DROPDOWN_BODY_WIDTH = 187;
export const AttributeHierarchyList: React.FC<IAttributeHierarchyListProps> = ({ hierarchies, onSelect }) => {
    return (
        <DropdownList
            className="hierarchies-dropdown-body s-hierarchies-dropdown-body"
            width={DROPDOWN_BODY_WIDTH}
            itemHeight={ITEM_HEIGHT}
            showSearch={false}
            items={hierarchies}
            renderItem={({ item }) => {
                return (
                    <AttributeHierarchyListItem
                        item={item}
                        onClick={() => {
                            onSelect(item);
                        }}
                    />
                );
            }}
        />
    );
};
