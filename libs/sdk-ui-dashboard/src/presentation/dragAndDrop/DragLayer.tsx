// (C) 2022 GoodData Corporation
import React, { CSSProperties, FC } from "react";
import { useDragLayer } from "react-dnd";
import { HeightResizerDragPreview } from "./DragLayerPreview/HeightResizerDragPreview";
import { DraggableInternalItemType, DraggableItemType, isDraggableInternalItemType } from "./types";
import { ContentDragPreview } from "./DragLayerPreview/ContentDragPreview";

const layerStyles: CSSProperties = {
    position: "fixed",
    pointerEvents: "none",
    zIndex: 5001,
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
};

const previewComponentsMap: Record<DraggableInternalItemType, any> = {
    "internal-height-resizer": HeightResizerDragPreview,
    "internal-width-resizer": () => undefined,
};

export const DragLayerComponent: FC = () => {
    const dragLayerProperties = useDragLayer((monitor) => ({
        item: monitor.getItem(),
        itemType: monitor.getItemType() as DraggableItemType,
        currentOffset: monitor.getSourceClientOffset(),
        initialOffset: monitor.getInitialSourceClientOffset(),
        differenceFromInitialOffset: monitor.getDifferenceFromInitialOffset(),
        isDragging: monitor.isDragging(),
    }));

    const { itemType, isDragging } = dragLayerProperties;

    if (!isDragging) {
        return null;
    }

    const documentDimensions = {
        scrollLeft: document.documentElement.scrollLeft,
        scrollTop: document.documentElement.scrollTop,
        scrollWidth: document.body.scrollWidth,
        scrollHeight: document.body.scrollHeight,
    };

    const Component = isDraggableInternalItemType(itemType)
        ? previewComponentsMap[itemType]
        : ContentDragPreview;

    return (
        <div style={layerStyles}>
            <Component {...dragLayerProperties} documentDimensions={documentDimensions} />
        </div>
    );
};
