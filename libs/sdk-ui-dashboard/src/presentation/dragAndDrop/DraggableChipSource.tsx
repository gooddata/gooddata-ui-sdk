// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { type DraggableContentItem } from "./types.js";
import { useDashboardDrag } from "./useDashboardDrag.js";

interface IDraggableChipSourceProps {
    dragItem: DraggableContentItem;
    canDrag: boolean;
    children: ReactNode;
}

/**
 * Drag source wrapper for filter-bar chips.
 *
 * @internal
 */
export function DraggableChipSource({ dragItem, canDrag, children }: IDraggableChipSourceProps) {
    const [{ isDragging }, dragRef] = useDashboardDrag({ dragItem, canDrag }, [dragItem.type, canDrag]);
    return (
        <div
            className={isDragging ? "is-dragging" : undefined}
            ref={(el) => {
                dragRef(el);
            }}
        >
            {children}
        </div>
    );
}
