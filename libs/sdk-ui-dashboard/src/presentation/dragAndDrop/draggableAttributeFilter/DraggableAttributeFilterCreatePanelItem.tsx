// (C) 2022-2025 GoodData Corporation
import React from "react";

import { CustomCreatePanelItemComponent } from "../../componentDefinition/index.js";
import { DraggableCreatePanelItem } from "../DraggableCreatePanelItem.js";
import { DraggableItem, IWrapCreatePanelItemWithDragComponent } from "../types.js";

/**
 * @internal
 */
export interface IDraggableAttributeFilterCreatePanelItemProps {
    CreatePanelItemComponent: CustomCreatePanelItemComponent;
    WrapCreatePanelItemWithDragComponent?: IWrapCreatePanelItemWithDragComponent;
    disabled?: boolean;
}

const dragItem: DraggableItem = {
    type: "attributeFilter-placeholder",
};

/**
 * @internal
 */
export function DraggableAttributeFilterCreatePanelItem({
    CreatePanelItemComponent,
    WrapCreatePanelItemWithDragComponent,
    disabled,
}: IDraggableAttributeFilterCreatePanelItemProps) {
    return (
        <DraggableCreatePanelItem
            Component={CreatePanelItemComponent}
            WrapCreatePanelItemWithDragComponent={WrapCreatePanelItemWithDragComponent}
            dragItem={dragItem}
            disabled={disabled}
            hideDefaultPreview={false}
        />
    );
}
