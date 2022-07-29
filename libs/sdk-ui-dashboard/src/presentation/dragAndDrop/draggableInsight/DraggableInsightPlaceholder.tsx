// (C) 2022 GoodData Corporation
import React from "react";
import { useDashboardDrag } from "../useDashboardDrag";
import classNames from "classnames";
import { useDashboardSelector, selectIsInEditMode } from "../../../model";
import {
    CustomDashboardInsightPlaceholderComponent,
    CustomDashboardInsightPlaceholderComponentProps,
} from "../types";

type DraggableInsightPlaceholderProps = {
    PlaceholderComponent: CustomDashboardInsightPlaceholderComponent;
    placeholderComponentProps: CustomDashboardInsightPlaceholderComponentProps;
};

export function DraggableInsightPlaceholder({
    PlaceholderComponent,
    placeholderComponentProps,
}: DraggableInsightPlaceholderProps) {
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const [{ isDragging }, dragRef] = useDashboardDrag({
        dragItem: {
            type: "insight-placeholder",
        },
        canDrag: isInEditMode,
        hideDefaultPreview: false,
    });

    return (
        <div className={classNames({ "is-dragging": isDragging })} ref={dragRef}>
            <PlaceholderComponent {...placeholderComponentProps} />
        </div>
    );
}
