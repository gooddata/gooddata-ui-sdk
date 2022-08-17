// (C) 2022 GoodData Corporation
import React from "react";
import classNames from "classnames";
import { IInsight } from "@gooddata/sdk-model";

import { useDashboardSelector, selectIsInEditMode } from "../../../model";
import { useDashboardDrag } from "../useDashboardDrag";
import {
    CustomDashboardInsightListItemComponent,
    CustomDashboardInsightListItemComponentProps,
} from "../types";
import { useWidgetDragStartHandler } from "./useWidgetDragStartHandler";
import { useWidgetDragEndHandler } from "./useWidgetDragEndHandler";

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
    const isInEditMode = useDashboardSelector(selectIsInEditMode);

    const handleDragStart = useWidgetDragStartHandler();
    const handleDragEnd = useWidgetDragEndHandler();

    const [{ isDragging }, dragRef] = useDashboardDrag(
        {
            dragItem: {
                type: "insightListItem",
                insight,
            },
            canDrag: isInEditMode,
            hideDefaultPreview: false,
            dragEnd: (_, monitor) => {
                handleDragEnd(monitor.didDrop());
            },
            dragStart: handleDragStart,
        },
        [isInEditMode, insight, handleDragStart, handleDragEnd],
    );

    return (
        <div className={classNames({ "is-dragging": isDragging })} ref={dragRef}>
            <ListItemComponent {...listItemComponentProps} />
        </div>
    );
}
