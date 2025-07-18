// (C) 2022-2025 GoodData Corporation
import cx from "classnames";
import { RefObject, useCallback, useEffect, useRef } from "react";
import { useInsightListItemDropHandler } from "./useInsightListItemDropHandler.js";
import { useInsightPlaceholderDropHandler } from "./useInsightPlaceholderDropHandler.js";
import { useKpiPlaceholderDropHandler } from "./useKpiPlaceholderDropHandler.js";
import { useRichTextPlaceholderDropHandler } from "./useRichTextPlaceholderDropHandler.js";
import { useVisualizationSwitcherPlaceholderDropHandler } from "./useVisualizationSwitcherPlaceholderDropHandler.js";
import { useMoveWidgetDropHandler } from "./useMoveWidgetHandler.js";
import { useWidgetDragHoverHandlers } from "./useWidgetDragHoverHandlers.js";
import {
    useDashboardDrop,
    isInsightDraggableListItem,
    isKpiPlaceholderDraggableItem,
    isInsightPlaceholderDraggableItem,
    isRichTextDraggableListItem,
    isVisualizationSwitcherDraggableListItem,
    isInsightDraggableItem,
    isKpiDraggableItem,
    isRichTextDraggableItem,
    isVisualizationSwitcherDraggableItem,
} from "../../../dragAndDrop/index.js";
import { getDropZoneDebugStyle } from "../../../dragAndDrop/debug.js";
import { DropZoneType } from "../../../../types.js";

interface IHotspotProps {
    sectionIndex: number;
    itemIndex: number;
    isLastInSection?: boolean;
    isEndingHotspot?: boolean;
    classNames?: string;
    dropZoneType: DropZoneType;
}

export function Hotspot(props: IHotspotProps) {
    const { itemIndex, sectionIndex, classNames, dropZoneType, isEndingHotspot } = props;
    const isOverLastValue = useRef(false);

    // for "next" we need to add the item after the current index, for "prev" on the current one
    const targetItemIndex = dropZoneType === "next" ? itemIndex + 1 : itemIndex;

    const handleInsightListItemDrop = useInsightListItemDropHandler(sectionIndex, targetItemIndex);
    const handleInsightPlaceholderDrop = useInsightPlaceholderDropHandler(sectionIndex, targetItemIndex);
    const handleKpiPlaceholderDrop = useKpiPlaceholderDropHandler(sectionIndex, targetItemIndex);
    const handleRichTextPlaceholderDrop = useRichTextPlaceholderDropHandler(sectionIndex, targetItemIndex);
    const handleVisualizationSwitcherPlaceholderDrop = useVisualizationSwitcherPlaceholderDropHandler(
        sectionIndex,
        targetItemIndex,
    );
    const handleWidgetDrop = useMoveWidgetDropHandler(sectionIndex, targetItemIndex);
    const { handleDragHoverStart } = useWidgetDragHoverHandlers();

    const [{ canDrop, isOver, item }, dropRef] = useDashboardDrop(
        [
            "insightListItem",
            "kpi-placeholder",
            "insight-placeholder",
            "kpi",
            "insight",
            "richText",
            "richTextListItem",
            "visualizationSwitcher",
            "visualizationSwitcherListItem",
        ],
        {
            drop: (item) => {
                if (isInsightDraggableListItem(item)) {
                    handleInsightListItemDrop(item.insight);
                }
                if (isKpiPlaceholderDraggableItem(item)) {
                    handleKpiPlaceholderDrop();
                }
                if (isInsightPlaceholderDraggableItem(item)) {
                    handleInsightPlaceholderDrop();
                }
                if (isRichTextDraggableListItem(item)) {
                    handleRichTextPlaceholderDrop();
                }
                if (isVisualizationSwitcherDraggableListItem(item)) {
                    handleVisualizationSwitcherPlaceholderDrop();
                }

                if (
                    isInsightDraggableItem(item) ||
                    isKpiDraggableItem(item) ||
                    isRichTextDraggableItem(item) ||
                    isVisualizationSwitcherDraggableItem(item)
                ) {
                    handleWidgetDrop(item);
                }
            },
        },
        [
            targetItemIndex,
            sectionIndex,
            handleInsightListItemDrop,
            handleInsightPlaceholderDrop,
            handleKpiPlaceholderDrop,
            handleWidgetDrop,
            handleVisualizationSwitcherPlaceholderDrop,
            handleRichTextPlaceholderDrop,
        ],
    );

    useEffect(() => {
        if (isOver) {
            handleDragHoverStart({ sectionIndex, itemIndex: targetItemIndex });
            isOverLastValue.current = isOver;
        }
    }, [isOver, sectionIndex, targetItemIndex, handleDragHoverStart]);

    const debugStyle = getDropZoneDebugStyle({ isOver });
    const canDropSafe = useCallback(
        (item: unknown) => {
            if (!item) {
                return false;
            }

            if (
                isInsightDraggableItem(item) ||
                isKpiDraggableItem(item) ||
                isRichTextDraggableItem(item) ||
                isVisualizationSwitcherDraggableItem(item)
            ) {
                return isEndingHotspot || item.sectionIndex !== sectionIndex || item.itemIndex !== itemIndex;
            }

            return true;
        },
        [isEndingHotspot, sectionIndex, itemIndex],
    );

    return (
        <div
            className={cx(classNames, "dropzone", dropZoneType, {
                hidden: !canDrop || !canDropSafe(item),
                full: isEndingHotspot,
            })}
            style={debugStyle}
            ref={dropRef as unknown as RefObject<HTMLDivElement>}
        />
    );
}
