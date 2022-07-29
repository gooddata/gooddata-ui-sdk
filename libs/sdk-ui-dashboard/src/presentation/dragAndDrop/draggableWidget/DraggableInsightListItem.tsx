// (C) 2022 GoodData Corporation
import React from "react";
import { useDashboardDrag } from "../useDashboardDrag";
import classNames from "classnames";
import { useDashboardSelector, selectIsInEditMode } from "../../../model";
import {
    CustomDashboardInsightListItemComponent,
    CustomDashboardInsightListItemComponentProps,
} from "../types";
import { ObjRef } from "@gooddata/sdk-model";

type DraggableInsightProps = {
    ListItemComponent: CustomDashboardInsightListItemComponent;
    listItemComponentProps: CustomDashboardInsightListItemComponentProps;
    insightRef: ObjRef;
};

export function DraggableInsightListItem({
    ListItemComponent,
    listItemComponentProps,
    insightRef,
}: DraggableInsightProps) {
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const [{ isDragging }, dragRef] = useDashboardDrag({
        dragItem: {
            type: "insightListItem",
            insightRef,
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
