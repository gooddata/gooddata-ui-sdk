// (C) 2022-2025 GoodData Corporation

import { type Ref, useEffect } from "react";

import cx from "classnames";

import { type IDashboardLayoutSizeByScreenSize } from "@gooddata/sdk-model";

import { SectionDropZoneBox } from "./SectionDropZoneBox.js";
import { useMoveWidgetToNewSectionDropHandler } from "./useMoveWidgetToNewSectionDropHandler.js";
import { useNewSectionDashboardLayoutPlaceholderDropHandler } from "./useNewSectionDashboardLayoutPlaceholderDropHandler.js";
import { useNewSectionInsightListItemDropHandler } from "./useNewSectionInsightListItemDropHandler.js";
import { useNewSectionInsightPlaceholderDropHandler } from "./useNewSectionInsightPlaceholderDropHandler.js";
import { useNewSectionRichTextPlaceholderDropHandler } from "./useNewSectionRichTextPlaceholderDropHandler.js";
import { useNewSectionVisualizationSwitcherPlaceholderDropHandler } from "./useNewSectionVisualizationSwitcherPlaceholderDropHandler.js";
import { useWidgetDragHoverHandlers } from "./useWidgetDragHoverHandlers.js";
import { isItemInSection } from "../../../../_staging/layout/coordinates.js";
import { useDashboardDispatch } from "../../../../model/index.js";
import { type ILayoutSectionPath } from "../../../../types.js";
import { getDropZoneDebugStyle } from "../../../dragAndDrop/debug.js";
import { draggableWidgetDropHandler } from "../../../dragAndDrop/draggableWidget/draggableWidgetDropHandler.js";
import { useDashboardDrop } from "../../../dragAndDrop/index.js";
import { isBaseDraggableMovingItem } from "../../../dragAndDrop/types.js";

export type RowPosition = "above" | "below";

interface ISectionHotspotProps {
    index: ILayoutSectionPath;
    targetPosition?: RowPosition;
    itemSize?: IDashboardLayoutSizeByScreenSize; // optional so I don't need to handle this in old layout yet
}

export function SectionHotspot({ index, targetPosition, itemSize }: ISectionHotspotProps) {
    const dispatch = useDashboardDispatch();

    const handleInsightListItemDrop = useNewSectionInsightListItemDropHandler(index);
    const handleInsightPlaceholderDrop = useNewSectionInsightPlaceholderDropHandler(index);
    const handleRichTextPlaceholderDrop = useNewSectionRichTextPlaceholderDropHandler(index);
    const handleVisualizationSwitcherPlaceholderDrop =
        useNewSectionVisualizationSwitcherPlaceholderDropHandler(index);
    const handleDashboardLayoutPlaceholderDrop = useNewSectionDashboardLayoutPlaceholderDropHandler(index);

    const moveWidgetToNewSection = useMoveWidgetToNewSectionDropHandler(index);
    const { handleDragHoverEnd } = useWidgetDragHoverHandlers();

    const [{ canDrop, isOver }, dropRef] = useDashboardDrop(
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
            "dashboardLayout",
            "dashboardLayoutListItem",
        ],
        {
            drop: (item) => {
                draggableWidgetDropHandler(item, {
                    handleInsightListItemDrop,
                    handleInsightPlaceholderDrop,
                    handleRichTextPlaceholderDrop,
                    handleVisualizationSwitcherPlaceholderDrop,
                    handleDashboardLayoutPlaceholderDrop,
                    handleWidgetDrop: moveWidgetToNewSection,
                });
            },
            canDrop: (item) => {
                if (isBaseDraggableMovingItem(item) && item.layoutPath) {
                    const itemCoordinates = item.layoutPath[item.layoutPath.length - 1];
                    const isAdjacentSection =
                        isItemInSection(item.layoutPath, index) &&
                        (index.sectionIndex === itemCoordinates.sectionIndex ||
                            index.sectionIndex === itemCoordinates.sectionIndex + 1);
                    return !(item.isOnlyItemInSection && isAdjacentSection);
                }
                return true;
            },
        },
        [
            dispatch,
            index,
            handleInsightListItemDrop,
            handleInsightPlaceholderDrop,
            handleVisualizationSwitcherPlaceholderDrop,
            handleDashboardLayoutPlaceholderDrop,
        ],
    );

    useEffect(() => {
        if (isOver) {
            handleDragHoverEnd();
        }
    }, [handleDragHoverEnd, isOver]);

    if (!canDrop) {
        return null;
    }

    const isLast = targetPosition === "below";
    const debugStyle = getDropZoneDebugStyle({ isOver });

    return (
        <div
            className={cx("row-hotspot-container", {
                last: isLast && canDrop,
                "s-last-drop-position": isLast && canDrop,
                hidden: !canDrop,
            })}
        >
            <div
                className={cx("row-hotspot", { hidden: !canDrop })}
                style={{ ...debugStyle }}
                ref={dropRef as unknown as Ref<HTMLDivElement> | undefined}
            >
                {!!isOver && <SectionDropZoneBox isOver={isOver} itemSize={itemSize} />}
            </div>
        </div>
    );
}
