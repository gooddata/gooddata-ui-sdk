// (C) 2022 GoodData Corporation
import React, { useCallback } from "react";

import {
    selectIsInEditMode,
    useDashboardDispatch,
    useDashboardSelector,
    useWidgetSelection,
    eagerRemoveSectionItem,
    selectWidgetPlaceholder,
    uiActions,
} from "../../../model";
import { DraggableItem } from "../types";
import { DraggableCreatePanelItem, IDraggableCreatePanelItemProps } from "../DraggableCreatePanelItem";
import { CustomCreatePanelItemComponent } from "../../componentDefinition";
import { useAddInitialSectionHandler } from "./useAddInitialSectionHandler";

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

    const addInitialSectionHandler = useAddInitialSectionHandler();

    const handleDragStart = useCallback(
        (item: DraggableItem) => {
            deselectWidgets();
            addInitialSectionHandler(item);
            dispatch(uiActions.setIsDraggingWidget(true));
        },
        [addInitialSectionHandler, deselectWidgets, dispatch],
    );

    const handleDragEnd = useCallback<Required<IDraggableCreatePanelItemProps>["onDragEnd"]>(
        (didDrop) => {
            if (!didDrop && widgetPlaceholder) {
                dispatch(eagerRemoveSectionItem(widgetPlaceholder.sectionIndex, widgetPlaceholder.itemIndex));
            }
            dispatch(uiActions.setIsDraggingWidget(false));
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
            onDragStart={handleDragStart}
        />
    );
};
