// (C) 2022 GoodData Corporation
import React from "react";
import cx from "classnames";

import { useDashboardDrag } from "./useDashboardDrag";
import { DraggableItem } from "./types";
import { CustomCreatePanelItemComponent } from "../componentDefinition";
import { selectIsInEditMode, useDashboardSelector } from "../../model";
import { useWidgetDragEndHandler } from "./draggableWidget/useWidgetDragEndHandler";

/**
 * @internal
 */
export type DraggableCreatePanelItemInnerProps = {
    Component: CustomCreatePanelItemComponent;
    dragItem: DraggableItem;
    hideDefaultPreview?: boolean;
    disabled?: boolean;
    canDrag: boolean;
    onDragStart?: (item: DraggableItem) => void;
    onDragEnd?: (didDrop: boolean) => void;
};

/**
 * @internal
 */
export type IDraggableCreatePanelItemProps = Pick<
    DraggableCreatePanelItemInnerProps,
    "Component" | "dragItem" | "disabled" | "hideDefaultPreview"
>;

/**
 * @internal
 */
export function useDraggableCreatePanelItemProps(
    props: IDraggableCreatePanelItemProps,
): DraggableCreatePanelItemInnerProps {
    const isInEditMode = useDashboardSelector(selectIsInEditMode);

    const onDragEnd = useWidgetDragEndHandler();

    const canDrag = isInEditMode && !props.disabled;

    return {
        ...props,
        canDrag,
        onDragEnd,
    };
}

/**
 * @internal
 */
export const DraggableCreatePanelItem: React.FC<IDraggableCreatePanelItemProps> = (props) => {
    const draggableCreatePanelItemProps = useDraggableCreatePanelItemProps(props);

    return <DraggableCreatePanelItemInner {...draggableCreatePanelItemProps} />;
};

/**
 * @internal
 */
export const DraggableCreatePanelItemInner: React.FC<DraggableCreatePanelItemInnerProps> = ({
    Component,
    dragItem,
    disabled,
    hideDefaultPreview,
    canDrag,
    onDragStart,
    onDragEnd,
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
