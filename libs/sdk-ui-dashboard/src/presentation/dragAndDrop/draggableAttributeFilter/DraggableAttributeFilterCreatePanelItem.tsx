// (C) 2022 GoodData Corporation
import React from "react";

import { selectIsInEditMode, useDashboardSelector } from "../../../model";
import { CustomDashboardAttributeFilterCreatePanelItemComponent, DraggableItem } from "../types";
import { DraggableCreatePanelItem } from "../DraggableCreatePanelItem";

/**
 * @internal
 */
export interface IDraggableAttributeFilterCreatePanelItemProps {
    CreatePanelItemComponent: CustomDashboardAttributeFilterCreatePanelItemComponent;
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

    return (
        <DraggableCreatePanelItem
            Component={CreatePanelItemComponent}
            disabled={disabled}
            canDrag={isInEditMode && !disabled}
            dragItem={dragItem}
            hideDefaultPreview={false}
        />
    );
};
