// (C) 2022-2026 GoodData Corporation

import { type CustomCreatePanelItemComponent } from "../../componentDefinition/types.js";
import { DraggableCreatePanelItem } from "../DraggableCreatePanelItem.js";
import { type DraggableItem, type IWrapCreatePanelItemWithDragComponent } from "../types.js";

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
