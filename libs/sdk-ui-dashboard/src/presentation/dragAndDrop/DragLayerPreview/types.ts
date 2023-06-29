// (C) 2022 GoodData Corporation
import { XYCoord } from "react-dnd";
import { DraggableInternalItem, DraggableItem } from "../types.js";

export type ReachedResizingLimit = "min" | "max" | "none";

export type DragPreviewProps<TDraggableItem extends DraggableItem> = {
    itemType: TDraggableItem["type"];
    item: TDraggableItem;
    clientOffset: XYCoord;
    currentOffset: XYCoord;
    initialOffset: XYCoord;
    differenceFromInitialOffset: XYCoord;
};

export type DragResizeProps<TDraggableItem extends DraggableInternalItem> =
    DragPreviewProps<TDraggableItem> & {
        getDragLayerPosition: () => XYCoord;
        scrollCorrection: XYCoord;
    };
