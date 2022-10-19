// (C) 2022 GoodData Corporation
import React from "react";

import { selectIsInEditMode, useDashboardSelector } from "../../../model";
import { DraggableItem } from "../types";
import { DraggableCreatePanelItem } from "../DraggableCreatePanelItem";
import { CustomCreatePanelItemComponent } from "../../componentDefinition";
import { useWidgetDragStartHandler } from "./useWidgetDragStartHandler";
import { useWidgetDragEndHandler } from "./useWidgetDragEndHandler";

interface IDraggableKpiCreatePanelItemProps {
    CreatePanelItemComponent: CustomCreatePanelItemComponent;
    disabled?: boolean;
}

const dragItem: DraggableItem = {
    type: "kpi-placeholder",
};

export const DraggableKpiCreatePanelItem: React.FC<IDraggableKpiCreatePanelItemProps> = ({
    CreatePanelItemComponent,
    disabled,
}) => {
    const isInEditMode = useDashboardSelector(selectIsInEditMode);

    const handleDragStart = useWidgetDragStartHandler();
    const handleDragEnd = useWidgetDragEndHandler();

    const dragEnabled = isInEditMode && !disabled;

    return (
        <DraggableCreatePanelItem
            Component={CreatePanelItemComponent}
            disabled={disabled}
            canDrag={dragEnabled}
            dragItem={dragItem}
            hideDefaultPreview={false}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
        />
    );
};
