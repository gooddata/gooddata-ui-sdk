// (C) 2022 GoodData Corporation
import React, { useCallback } from "react";

import {
    uiActions,
    selectIsInEditMode,
    useDashboardDispatch,
    useDashboardSelector,
    useWidgetSelection,
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

    const handleDragEnd = useCallback<Required<IDraggableCreatePanelItemProps>["onDragEnd"]>(
        (didDrop) => {
            if (!didDrop) {
                dispatch(uiActions.clearWidgetPlaceholder());
            }
        },
        [dispatch],
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
