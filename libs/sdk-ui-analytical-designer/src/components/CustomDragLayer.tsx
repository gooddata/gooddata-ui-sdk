// (C) 2007-2026 GoodData Corporation

import { useEffect, useState } from "react";

import { useDragLayer } from "@evil-internetmann/react-dnd";
import CustomEvent from "custom-event";
import { useDispatch } from "react-redux";
import { type Action, type Dispatch } from "redux";

import { GOODSTRAP_DRAG_EVENT } from "@gooddata/sdk-ui-kit";

import { dragItemFailed } from "../sagas/drag_and_drop/drag_and_drop_actions.js";
import { type AppDispatch } from "../store/types.js";
import { type IDraggableBucketItem, type IDraggedItem } from "../typings/drag_and_drop.js";

function getItemStyles({ currentOffset }: ICustomDragLayerState) {
    if (!currentOffset) {
        return {
            display: "none",
        };
    }

    const transform = `translate(${currentOffset.x}px, ${currentOffset.y}px)`;
    return {
        transform,
        WebkitTransform: transform,
    };
}

export function setCurrentState(
    newProps: ICustomDragLayerProps,
    state: ICustomDragLayerState,
    setState: (updater: (prev: ICustomDragLayerState) => ICustomDragLayerState) => void,
    dispatch: Dispatch<Action> = (v) => v,
    windowInstance: { dispatchEvent: (event: Event) => unknown } = { dispatchEvent: () => {} },
) {
    const { isDragging, item, currentOffset } = newProps;
    const didDrop = isDragging && !currentOffset;
    const itemChanged = item !== state.item && !!item;
    const startedDragging = itemChanged && isDragging;

    if (startedDragging) {
        // item will be required after isDragging is false, as well as initial coordinates
        setState((prev: ICustomDragLayerState): ICustomDragLayerState => ({
            ...prev,
            item,
            initialOffset: currentOffset,
        }));

        windowInstance.dispatchEvent(new CustomEvent(GOODSTRAP_DRAG_EVENT));
    }

    if (isDragging) {
        setState((prev: ICustomDragLayerState): ICustomDragLayerState => ({
            ...prev,
            currentOffset,
        }));
    }

    if (didDrop) {
        setState((prev: ICustomDragLayerState): ICustomDragLayerState => ({
            ...prev,
            item: null,
            initialOffset: null,
        }));
    }

    if (!isDragging && !didDrop && state.currentOffset && state.item) {
        // need to use state data, because at this point the props ones don't exist
        // there is a case when hot reload runs, when there's no state and this is being run
        // in that case use N/A
        const mouseX = state?.currentOffset?.x ?? "N/A";
        const mouseY = state?.currentOffset?.y ?? "N/A";
        // a filter drag item carries neither field — the same N/A the untyped code reported
        const draggedProbe = state?.item as Partial<IDraggableBucketItem> | null | undefined;
        const from = draggedProbe?.from ?? "N/A";
        const dragged = draggedProbe?.dragged ?? "N/A";

        dispatch(dragItemFailed(mouseX, mouseY, from, dragged));
        setState((prev: ICustomDragLayerState): ICustomDragLayerState => ({
            ...prev,
            item: null,
            initialOffset: null,
        }));
    }
}

interface ICustomDragLayerProps {
    item: IDraggedItem | null;
    currentOffset: IOffset | null;
    initialOffset: IOffset | null;
    isDragging: boolean;
}

interface ICustomDragLayerOwnProps {
    itemType?: string;
}

export type CustomDragLayerProps = ICustomDragLayerOwnProps & ICustomDragLayerProps;

interface IOffset {
    x: number;
    y: number;
}

export interface ICustomDragLayerState {
    initialOffset: IOffset | null;
    currentOffset: IOffset | null;
    item: IDraggedItem | null;
}

export function CustomDragLayer(_props: ICustomDragLayerOwnProps) {
    const dispatch = useDispatch<AppDispatch>();

    const collected = useDragLayer((monitor) => ({
        item: monitor.getItem(),
        currentOffset: monitor.getSourceClientOffset(),
        initialOffset: monitor.getInitialClientOffset(),
        isDragging: monitor.isDragging(),
    })) as ICustomDragLayerProps;

    const [state, setStateLocal] = useState<ICustomDragLayerState>({
        item: null,
        initialOffset: null,
        currentOffset: null,
    });

    useEffect(() => {
        setCurrentState(collected, state, setStateLocal, dispatch, window);
        // oxlint-disable-next-line react-hooks/exhaustive-deps
    }, [collected.item, collected.currentOffset, collected.isDragging]);

    const renderItem = (item: IDraggedItem | null) => {
        if (typeof item?.renderDraggedItemElement !== "function") {
            return null;
        }
        return item.renderDraggedItemElement();
    };

    if (!state.item) {
        return null;
    }

    return (
        <div className="adi-custom-drag-layer">
            <div style={getItemStyles(state)}>{renderItem(state.item)}</div>
        </div>
    );
}
