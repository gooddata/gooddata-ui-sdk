// (C) 2022 GoodData Corporation
import { XYCoord } from "react-dnd";
import { DraggableItem } from "../types";

export type ReachedHeightResizingLimit = "min" | "max" | "none";

export type DragPreviewProps<TDraggableItem extends DraggableItem> = {
    itemType: TDraggableItem["type"];
    item: TDraggableItem;
    currentOffset: XYCoord;
    initialOffset: XYCoord;
    differenceFromInitialOffset: XYCoord;
    documentDimensions: {
        scrollLeft: number;
        scrollTop: number;
        scrollWidth: number;
        scrollHeight: number;
    };
};
