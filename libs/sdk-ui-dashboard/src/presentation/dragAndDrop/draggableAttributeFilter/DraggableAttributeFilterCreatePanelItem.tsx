// (C) 2022 GoodData Corporation
import React from "react";

import { DraggableItem } from "../types";
import { DraggableCreatePanelItem } from "../DraggableCreatePanelItem";
import { CustomCreatePanelItemComponent } from "../../componentDefinition";

/**
 * @internal
 */
export interface IDraggableAttributeFilterCreatePanelItemProps {
    CreatePanelItemComponent: CustomCreatePanelItemComponent;
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
> = ({ CreatePanelItemComponent, disabled }) => {
    return (
        <DraggableCreatePanelItem
            Component={CreatePanelItemComponent}
            dragItem={dragItem}
            disabled={disabled}
            hideDefaultPreview={false}
        />
    );
};
