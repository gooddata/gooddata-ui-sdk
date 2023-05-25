// (C) 2022 GoodData Corporation
import React from "react";
import cx from "classnames";

import { useDashboardDrag } from "./useDashboardDrag.js";
import { useWidgetDragEndHandler } from "./draggableWidget/index.js";
import { selectIsInEditMode, useDashboardSelector } from "../../model/index.js";
import { IWrapCreatePanelItemWithDragInnerProps, IWrapCreatePanelItemWithDragProps } from "./types.js";

/**
 * @internal
 */
export const WrapCreatePanelItemWithDrag: React.FC<IWrapCreatePanelItemWithDragProps> = (props) => {
    const { canDrag, dragItem, hideDefaultPreview, onDragEnd, onDragStart, children } =
        useWrapCreatePanelItemWithDrag(props);

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
            {children}
        </div>
    );
};

/**
 * @internal
 */
export function useWrapCreatePanelItemWithDrag(
    props: IWrapCreatePanelItemWithDragProps,
): IWrapCreatePanelItemWithDragInnerProps {
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const onDragEnd = useWidgetDragEndHandler();

    const canDrag = isInEditMode && !props.disabled;

    return {
        ...props,
        canDrag,
        onDragEnd,
    };
}
