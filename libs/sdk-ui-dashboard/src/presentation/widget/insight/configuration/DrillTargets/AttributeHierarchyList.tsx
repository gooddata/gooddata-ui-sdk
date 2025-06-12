// (C) 2023 GoodData Corporation

import React from "react";
import { ICatalogAttributeHierarchy, ICatalogDateAttributeHierarchy } from "@gooddata/sdk-model";
import { DropdownList, withBubble } from "@gooddata/sdk-ui-kit";

import { messages } from "../../../../../locales.js";
import { useDashboardUserInteraction } from "../../../../../model/index.js";

import { AttributeHierarchyListItem } from "./AttributeHierarchyListItem.js";
import AttributeHierarchyListFooter from "./AttributeHierarchyListFooter.js";

/**
 * @internal
 */
export interface IAttributeHierarchyItem {
    isDisabled: boolean;
    hierarchy: ICatalogAttributeHierarchy | ICatalogDateAttributeHierarchy;
}

/**
 * @internal
 */
export interface IAttributeHierarchyListProps {
    hierarchies: IAttributeHierarchyItem[];
    onSelect: (selectedDashboard: ICatalogAttributeHierarchy | ICatalogDateAttributeHierarchy) => void;
    onOpenAttributeHierarchyDialog: (
        attributeHierarchy?: ICatalogAttributeHierarchy | ICatalogDateAttributeHierarchy,
    ) => void;
    closeDropdown: () => void;
}

const ITEM_HEIGHT = 28;
const DROPDOWN_BODY_WIDTH = 187;

const AttributeHierarchyListItemWithBubble = withBubble(AttributeHierarchyListItem);

export const AttributeHierarchyList: React.FC<IAttributeHierarchyListProps> = ({
    hierarchies,
    onSelect,
    closeDropdown,
    onOpenAttributeHierarchyDialog,
}) => {
    const userInteraction = useDashboardUserInteraction();

    const onClick = (item: IAttributeHierarchyItem) => {
        if (!item.isDisabled) {
            onSelect(item.hierarchy);
        }
    };

    const handleFooterButtonClick = () => {
        onOpenAttributeHierarchyDialog();
        closeDropdown();
        userInteraction.attributeHierarchiesInteraction("attributeHierarchyDrillDownCreateClicked");
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
                    <AttributeHierarchyListItemWithBubble
                        item={item.hierarchy}
                        isDisabled={item.isDisabled}
                        onEdit={onOpenAttributeHierarchyDialog}
                        onClick={() => {
                            onClick(item);
                        }}
                        showBubble={item.isDisabled}
                        bubbleTextId={messages.disableUsedDrillDownTooltip.id}
                    />
                );
            }}
        />
    );
};
