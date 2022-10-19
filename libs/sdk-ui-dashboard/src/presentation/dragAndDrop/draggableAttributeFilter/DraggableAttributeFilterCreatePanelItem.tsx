// (C) 2022 GoodData Corporation
import React from "react";

import { selectIsInEditMode, useDashboardSelector } from "../../../model";
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
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const dragEnabled = isInEditMode && !disabled;

    return (
        <DraggableCreatePanelItem
            Component={CreatePanelItemComponent}
            disabled={disabled}
            canDrag={dragEnabled}
            dragItem={dragItem}
            hideDefaultPreview={false}
        />
    );
};
