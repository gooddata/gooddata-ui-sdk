// (C) 2022-2025 GoodData Corporation

import { Ref } from "react";

import cx from "classnames";

import { useWidgetDragEndHandler } from "./draggableWidget/useWidgetDragEndHandler.js";
import { IWrapCreatePanelItemWithDragInnerProps, IWrapCreatePanelItemWithDragProps } from "./types.js";
import { useDashboardDrag } from "./useDashboardDrag.js";
import { selectIsInEditMode, useDashboardSelector } from "../../model/index.js";

/**

/**
 * @internal
 */
export function WrapCreatePanelItemWithDrag(props: IWrapCreatePanelItemWithDragProps) {
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
        <div
            ref={dragRef as unknown as Ref<HTMLDivElement> | undefined}
            className={cx({ "is-dragging": isDragging })}
        >
            {children}
        </div>
    );
}

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
