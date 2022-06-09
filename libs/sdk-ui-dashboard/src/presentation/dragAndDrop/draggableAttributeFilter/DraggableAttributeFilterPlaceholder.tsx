// (C) 2022 GoodData Corporation
import React from "react";
import { useDashboardDrag } from "../useDashboardDrag";
import classNames from "classnames";
import { useDashboardSelector, selectIsInEditMode } from "../../../model";
import {
    CustomDashboardAttributeFilterPlaceholderComponent,
    CustomDashboardAttributeFilterPlaceholderComponentProps,
} from "../types";

type DraggableAttributeFilterPlaceholderProps = {
    PlaceholderComponent: CustomDashboardAttributeFilterPlaceholderComponent;
    placeholderComponentProps: CustomDashboardAttributeFilterPlaceholderComponentProps;
};

export function DraggableAttributeFilterPlaceholder({
    PlaceholderComponent,
    placeholderComponentProps,
}: DraggableAttributeFilterPlaceholderProps) {
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const [{ isDragging }, dragRef] = useDashboardDrag({
        dragItem: {
            type: "attributeFilter-placeholder",
        },
        canDrag: isInEditMode && !placeholderComponentProps.disabled,
        hideDefaultPreview: false,
    });

    return (
        <div
            className={classNames({
                "is-dragging": isDragging,
            })}
            ref={dragRef}
        >
            <PlaceholderComponent {...placeholderComponentProps} />
        </div>
    );
}
