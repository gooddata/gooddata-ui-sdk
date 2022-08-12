// (C) 2022 GoodData Corporation
import React, { FC, useMemo } from "react";
import { XYCoord } from "react-dnd";
import { useDashboardComponentsContext } from "../../dashboardContexts";

import { DEBUG_SHOW_DROP_ZONES } from "../debug";
import { DraggableContentItem, DraggableContentItemType } from "../types";
import { DragPreviewProps } from "./types";

function getItemStyles(initialOffset: XYCoord | null, currentOffset: XYCoord | null) {
    if (!initialOffset || !currentOffset) {
        return {
            display: "none",
        };
    }

    const { x, y } = currentOffset;

    const transform = `translate(${x}px, ${y}px)`;
    return {
        transform,
        WebkitTransform: transform,
    };
}

export const ContentDragPreview: FC<DragPreviewProps<DraggableContentItem>> = (props) => {
    const { itemType, item, initialOffset, currentOffset } = props;

    const { AttributeFilterComponentSet } = useDashboardComponentsContext();
    const previewComponentsMap = useMemo<Partial<Record<DraggableContentItemType, any>>>(
        () => ({
            attributeFilter: AttributeFilterComponentSet.dragging.DraggingComponent,
        }),
        [AttributeFilterComponentSet.dragging.DraggingComponent],
    );

    const component = useMemo(() => {
        if (!(itemType in previewComponentsMap)) {
            if (DEBUG_SHOW_DROP_ZONES) {
                // eslint-disable-next-line no-console
                console.warn(`DND: dnd item ${itemType} not handled by CustomDragLayer`);
            }
            return null;
        }

        const Component = previewComponentsMap[itemType];
        return <Component itemType={itemType} item={item} />;
    }, [itemType, previewComponentsMap, item]);

    return (
        <div className="drag-preview" style={getItemStyles(initialOffset, currentOffset)}>
            {component}
        </div>
    );
};
