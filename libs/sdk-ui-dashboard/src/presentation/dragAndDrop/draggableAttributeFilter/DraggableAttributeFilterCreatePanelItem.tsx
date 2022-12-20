// (C) 2022 GoodData Corporation
import React from "react";

import { IWrapCreatePanelItemWithDragComponent, DraggableItem } from "../types";
import { DraggableCreatePanelItem } from "../DraggableCreatePanelItem";
import { CustomCreatePanelItemComponent } from "../../componentDefinition";

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
export const DraggableAttributeFilterCreatePanelItem: React.FC<
    IDraggableAttributeFilterCreatePanelItemProps
> = ({ CreatePanelItemComponent, WrapCreatePanelItemWithDragComponent, disabled }) => {
    return (
        <DraggableCreatePanelItem
            Component={CreatePanelItemComponent}
            WrapCreatePanelItemWithDragComponent={WrapCreatePanelItemWithDragComponent}
            dragItem={dragItem}
            disabled={disabled}
            hideDefaultPreview={false}
        />
    );
};
