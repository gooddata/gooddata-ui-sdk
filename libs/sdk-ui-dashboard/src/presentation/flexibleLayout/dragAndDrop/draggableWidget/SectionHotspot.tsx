// (C) 2022-2024 GoodData Corporation
import cx from "classnames";
import React, { useEffect } from "react";
import { IDashboardLayoutSizeByScreenSize } from "@gooddata/sdk-model";

import { useDashboardDispatch } from "../../../../model/index.js";
import { isBaseDraggableMovingItem } from "../../../dragAndDrop/types.js";
import { getDropZoneDebugStyle } from "../../../dragAndDrop/debug.js";
import { useDashboardDrop } from "../../../dragAndDrop/index.js";
import { useMoveWidgetToNewSectionDropHandler } from "./useMoveWidgetToNewSectionDropHandler.js";
import { useNewSectionInsightListItemDropHandler } from "./useNewSectionInsightListItemDropHandler.js";
import { useNewSectionInsightPlaceholderDropHandler } from "./useNewSectionInsightPlaceholderDropHandler.js";
import { useNewSectionKpiPlaceholderDropHandler } from "./useNewSectionKpiPlaceholderDropHandler.js";
import { useNewSectionRichTextPlaceholderDropHandler } from "./useNewSectionRichTextPlaceholderDropHandler.js";
import { useNewSectionVisualizationSwitcherPlaceholderDropHandler } from "./useNewSectionVisualizationSwitcherPlaceholderDropHandler.js";
import { useNewSectionDashboardLayoutPlaceholderDropHandler } from "./useNewSectionDashboardLayoutPlaceholderDropHandler.js";
import { ILayoutSectionPath } from "../../../../types.js";
import { isItemInSection } from "../../../../_staging/layout/coordinates.js";
import { draggableWidgetDropHandler } from "../../../dragAndDrop/draggableWidget/draggableWidgetDropHandler.js";

import { SectionDropZoneBox } from "./SectionDropZoneBox.js";
import { useWidgetDragHoverHandlers } from "./useWidgetDragHoverHandlers.js";

export type RowPosition = "above" | "below";

interface ISectionHotspotProps {
    index: ILayoutSectionPath;
    targetPosition?: RowPosition;
    itemSize?: IDashboardLayoutSizeByScreenSize; // optional so I don't need to handle this in old layout yet
}

export const SectionHotspot: React.FC<ISectionHotspotProps> = ({ index, targetPosition, itemSize }) => {
    const dispatch = useDashboardDispatch();

    const handleInsightListItemDrop = useNewSectionInsightListItemDropHandler(index);
    const handleKpiPlaceholderDrop = useNewSectionKpiPlaceholderDropHandler(index);
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
                    handleKpiPlaceholderDrop,
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
            handleKpiPlaceholderDrop,
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
            <div className={cx("row-hotspot", { hidden: !canDrop })} style={{ ...debugStyle }} ref={dropRef}>
                {!!isOver && <SectionDropZoneBox isOver={isOver} itemSize={itemSize} />}
            </div>
        </div>
    );
};
