// (C) 2022 GoodData Corporation
import React, { useEffect } from "react";
import classNames from "classnames";
import { IInsight } from "@gooddata/sdk-model";

import {
    useDashboardSelector,
    selectIsInEditMode,
    useDashboardDispatch,
    useWidgetSelection,
    eagerRemoveSectionItem,
    selectWidgetPlaceholder,
} from "../../../model";
import { useDashboardDrag } from "../useDashboardDrag";
import {
    CustomDashboardInsightListItemComponent,
    CustomDashboardInsightListItemComponentProps,
} from "../types";

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
            },
        },
        [isInEditMode, insight, widgetPlaceholder],
    );

    // deselect all widgets when starting the drag
    useEffect(() => {
        if (isDragging) {
            deselectWidgets();
        }
    }, [deselectWidgets, isDragging]);

    return (
        <div className={classNames({ "is-dragging": isDragging })} ref={dragRef}>
            <ListItemComponent {...listItemComponentProps} />
        </div>
    );
}
