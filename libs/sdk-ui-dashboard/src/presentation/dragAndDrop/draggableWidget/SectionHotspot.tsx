// (C) 2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { getDropZoneDebugStyle } from "../debug";
import {
    eagerRemoveSectionItem,
    selectWidgetPlaceholderCoordinates,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model";
import { useDashboardDrop } from "../useDashboardDrop";
import { SectionDropZoneBox } from "./SectionDropZoneBox";
import {
    isInsightDraggableListItem,
    isInsightPlaceholderDraggableItem,
    isKpiPlaceholderDraggableItem,
} from "../../dragAndDrop/types";
import { useNewSectionInsightListItemDropHandler } from "./useNewSectionInsightListItemDropHandler";
import { useNewSectionInsightPlaceholderDropHandler } from "./useNewSectionInsightPlaceholderDropHandler";
import { useNewSectionKpiPlaceholderDropHandler } from "./useNewSectionKpiPlaceholderDropHandler";

export type RowPosition = "above" | "below";

interface ISectionHotspotProps {
    index: number;
    targetPosition?: RowPosition;
}

export const SectionHotspot: React.FC<ISectionHotspotProps> = (props) => {
    const { index, targetPosition } = props;

    const dispatch = useDashboardDispatch();
    const widgetPlaceholderCoords = useDashboardSelector(selectWidgetPlaceholderCoordinates);

    const handleInsightListItemDrop = useNewSectionInsightListItemDropHandler(index);
    const handleKpiPlaceholderDrop = useNewSectionKpiPlaceholderDropHandler(index);
    const handleInsightPlaceholderDrop = useNewSectionInsightPlaceholderDropHandler(index);

    const [{ canDrop, isOver }, dropRef] = useDashboardDrop(
        ["insightListItem", "kpi-placeholder", "insight-placeholder"],
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
            },
            hover: () => {
                if (widgetPlaceholderCoords) {
                    dispatch(
                        eagerRemoveSectionItem(
                            widgetPlaceholderCoords.sectionIndex,
                            widgetPlaceholderCoords.itemIndex,
                        ),
                    );
                }
            },
        },
        [
            dispatch,
            widgetPlaceholderCoords,
            index,
            handleInsightListItemDrop,
            handleKpiPlaceholderDrop,
            handleInsightPlaceholderDrop,
        ],
    );

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
                {!!isOver && <SectionDropZoneBox isOver={isOver} />}
            </div>
        </div>
    );
};
