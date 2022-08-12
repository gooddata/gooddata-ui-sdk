// (C) 2022 GoodData Corporation
import React, { useCallback } from "react";

import {
    selectIsInEditMode,
    useDashboardDispatch,
    useDashboardSelector,
    useWidgetSelection,
    eagerRemoveSectionItem,
    selectWidgetPlaceholder,
} from "../../../model";
import { DraggableItem } from "../types";
import { DraggableCreatePanelItem, IDraggableCreatePanelItemProps } from "../DraggableCreatePanelItem";
import { CustomCreatePanelItemComponent } from "../../componentDefinition";

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
    const dispatch = useDashboardDispatch();
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const { deselectWidgets } = useWidgetSelection();
    const widgetPlaceholder = useDashboardSelector(selectWidgetPlaceholder);

    const handleDragEnd = useCallback<Required<IDraggableCreatePanelItemProps>["onDragEnd"]>(
        (didDrop) => {
            if (!didDrop && widgetPlaceholder) {
                dispatch(eagerRemoveSectionItem(widgetPlaceholder.sectionIndex, widgetPlaceholder.itemIndex));
            }
        },
        [dispatch, widgetPlaceholder],
    );

    return (
        <DraggableCreatePanelItem
            Component={CreatePanelItemComponent}
            disabled={disabled}
            canDrag={isInEditMode && !disabled}
            dragItem={dragItem}
            hideDefaultPreview={false}
            onDragEnd={handleDragEnd}
            onDragStart={deselectWidgets}
        />
    );
};
