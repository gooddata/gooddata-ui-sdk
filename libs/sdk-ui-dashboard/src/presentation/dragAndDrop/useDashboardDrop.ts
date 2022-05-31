// (C) 2022 GoodData Corporation

import { DropTargetMonitor, DropTargetHookSpec, useDrop } from "react-dnd";
import { DraggableItemType, DraggableItemTypeMapping } from "./types";

type DashboardDropTargetHookSpec<DragObject, CollectedProps> = Pick<
    DropTargetHookSpec<DragObject, void, CollectedProps>,
    "canDrop" | "drop"
>;

const basicDropCollect = (monitor: DropTargetMonitor) => ({
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
});

export function useDashboardDrop<
    DragType extends DraggableItemType,
    DragObject = DraggableItemTypeMapping[DragType],
    CollectedProps = ReturnType<typeof basicDropCollect>,
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
        },
        deps,
    );
}
