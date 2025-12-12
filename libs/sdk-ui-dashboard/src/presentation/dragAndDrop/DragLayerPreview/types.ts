// (C) 2022-2025 GoodData Corporation

import { type XYCoord } from "@evil-internetmann/react-dnd";

import { type DraggableInternalItem, type DraggableItem } from "../types.js";

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
