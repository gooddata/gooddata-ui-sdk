// (C) 2022 GoodData Corporation
import React, { useCallback } from "react";
import classNames from "classnames";
import { IInsight } from "@gooddata/sdk-model";

import {
    useDashboardSelector,
    selectIsInEditMode,
    useDashboardDispatch,
    useWidgetSelection,
    eagerRemoveSectionItem,
    selectWidgetPlaceholder,
    uiActions,
} from "../../../model";
import { useDashboardDrag } from "../useDashboardDrag";
import {
    CustomDashboardInsightListItemComponent,
    CustomDashboardInsightListItemComponentProps,
    DraggableItem,
} from "../types";
import { useAddInitialSectionHandler } from "./useAddInitialSectionHandler";

/**
 * @internal
 */
export interface IDraggableInsightListItemProps {
    ListItemComponent: CustomDashboardInsightListItemComponent;
    listItemComponentProps: CustomDashboardInsightListItemComponentProps;
    insight: IInsight;
}

/**
 * @internal
 */
export function DraggableInsightListItem({
    ListItemComponent,
    listItemComponentProps,
    insight,
}: IDraggableInsightListItemProps) {
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

    const [{ isDragging }, dragRef] = useDashboardDrag(
        {
            dragItem: {
                type: "insightListItem",
                insight,
            },
            canDrag: isInEditMode,
            hideDefaultPreview: false,
            dragEnd: (_, monitor) => {
                if (!monitor.didDrop() && widgetPlaceholder) {
                    dispatch(
                        eagerRemoveSectionItem(widgetPlaceholder.sectionIndex, widgetPlaceholder.itemIndex),
                    );
                }
                dispatch(uiActions.setIsDraggingWidget(false));
            },
            dragStart: handleDragStart,
        },
        [isInEditMode, insight, widgetPlaceholder],
    );

    return (
        <div className={classNames({ "is-dragging": isDragging })} ref={dragRef}>
            <ListItemComponent {...listItemComponentProps} />
        </div>
    );
}
