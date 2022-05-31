// (C) 2022 GoodData Corporation
import React, { CSSProperties, FC, useMemo } from "react";
import { useDragLayer, XYCoord } from "react-dnd";
import { DefaultAttributeFilterDraggingComponent } from "./draggableAttributeFilter";
import { DraggableItemType } from "./types";

const layerStyles: CSSProperties = {
    position: "fixed",
    pointerEvents: "none",
    zIndex: 5001,
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
};

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

export const DragLayerComponent: FC = () => {
    const { itemType, isDragging, item, initialOffset, currentOffset } = useDragLayer((monitor) => ({
        item: monitor.getItem(),
        itemType: monitor.getItemType() as DraggableItemType,
        initialOffset: monitor.getInitialSourceClientOffset(),
        currentOffset: monitor.getSourceClientOffset(),
        isDragging: monitor.isDragging(),
    }));

    const component = useMemo(() => {
        // eslint-disable-next-line sonarjs/no-small-switch
        switch (itemType) {
            case "attributeFilter":
                // TODO get from filter, accept filter custom component definition
                return <DefaultAttributeFilterDraggingComponent itemType={itemType} item={item} />;
            default:
                return null;
        }
    }, [itemType]);

    if (!isDragging) {
        return null;
    }

    return (
        <div style={layerStyles}>
            <div className="drag-preview" style={getItemStyles(initialOffset, currentOffset)}>
                {component}
            </div>
        </div>
    );
};
