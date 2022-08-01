// (C) 2022 GoodData Corporation
import React from "react";
import { useDashboardDrag } from "../useDashboardDrag";
import classNames from "classnames";
import { useDashboardSelector, selectIsInEditMode } from "../../../model";
import {
    CustomDashboardInsightListItemComponent,
    CustomDashboardInsightListItemComponentProps,
} from "../types";
import { IInsight } from "@gooddata/sdk-model";

type DraggableInsightProps = {
    ListItemComponent: CustomDashboardInsightListItemComponent;
    listItemComponentProps: CustomDashboardInsightListItemComponentProps;
    insight: IInsight;
};

export function DraggableInsightListItem({
    ListItemComponent,
    listItemComponentProps,
    insight,
}: DraggableInsightProps) {
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const [{ isDragging }, dragRef] = useDashboardDrag({
        dragItem: {
            type: "insightListItem",
            insight,
        },
        canDrag: isInEditMode,
        hideDefaultPreview: false,
    });

    return (
        <div className={classNames({ "is-dragging": isDragging })} ref={dragRef}>
            <ListItemComponent {...listItemComponentProps} />
        </div>
    );
}
