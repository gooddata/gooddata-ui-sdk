// (C) 2022 GoodData Corporation

import { DropTargetMonitor, DropTargetHookSpec, useDrop } from "react-dnd";
import { DraggableItem, DraggableItemType, DraggableItemTypeMapping } from "./types.js";

type DashboardDropTargetHookSpec<DragObject, CollectedProps> = Pick<
    DropTargetHookSpec<DragObject, void, CollectedProps>,
    "canDrop" | "drop" | "hover"
>;

const basicDropCollect = <DraggableObject = DraggableItem>(monitor: DropTargetMonitor<DraggableObject>) => ({
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
    itemType: monitor.getItemType() as DraggableItemType,
    item: monitor.getItem() as DraggableObject,
});

class BasicDropCollectTypeWrapper<DraggableObject = DraggableItem> {
    basicDropCollect = (...args: Parameters<typeof basicDropCollect>) =>
        basicDropCollect<DraggableObject>(...args);
}

type BasicDropCollectReturnType<DraggableObject = DraggableItem> = ReturnType<
    BasicDropCollectTypeWrapper<DraggableObject>["basicDropCollect"]
>;

export function useDashboardDrop<
    DragType extends DraggableItemType,
    DragObject = DraggableItemTypeMapping[DragType],
    CollectedProps = BasicDropCollectReturnType<DragObject>,
>(
    draggableItemTypes: DragType | DragType[],
    specArg: DashboardDropTargetHookSpec<DragObject, CollectedProps>,
    deps?: unknown[],
) {
    return useDrop(
        {
            accept: draggableItemTypes,
            drop: specArg.drop,
            canDrop: specArg.canDrop,
            collect: basicDropCollect,
            hover: specArg.hover,
        },
        deps,
    );
}
