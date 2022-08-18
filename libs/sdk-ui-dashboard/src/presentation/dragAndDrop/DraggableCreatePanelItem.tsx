// (C) 2022 GoodData Corporation
import React from "react";
import cx from "classnames";

import { useDashboardDrag } from "./useDashboardDrag";
import { DraggableItem } from "./types";
import { CustomCreatePanelItemComponent } from "../componentDefinition";

/**
 * @internal
 */
export interface IDraggableCreatePanelItemProps {
    Component: CustomCreatePanelItemComponent;
    disabled?: boolean;
    canDrag: boolean;
    onDragStart?: (item: DraggableItem) => void;
    onDragEnd?: (didDrop: boolean) => void;
    dragItem: DraggableItem;
    hideDefaultPreview?: boolean;
}

/**
 * @internal
 */
export const DraggableCreatePanelItem: React.FC<IDraggableCreatePanelItemProps> = ({
    Component,
    disabled,
    canDrag,
    onDragStart,
    onDragEnd,
    dragItem,
    hideDefaultPreview,
}) => {
    const [{ isDragging }, dragRef] = useDashboardDrag(
        {
            dragItem,
            canDrag,
            hideDefaultPreview,
            dragEnd: (_, monitor) => {
                onDragEnd?.(monitor.didDrop());
            },
            dragStart: onDragStart,
        },
        [canDrag, onDragEnd, hideDefaultPreview, dragItem],
    );

    return (
        <div ref={dragRef} className={cx({ "is-dragging": isDragging })}>
            <Component disabled={disabled} />
        </div>
    );
};
