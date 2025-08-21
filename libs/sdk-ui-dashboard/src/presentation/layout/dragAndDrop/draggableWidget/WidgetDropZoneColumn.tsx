// (C) 2007-2025 GoodData Corporation
import React, { useMemo } from "react";

import cx from "classnames";
import { Col } from "react-grid-system";

import { ScreenSize } from "@gooddata/sdk-model";

import { useInsightListItemDropHandler } from "./useInsightListItemDropHandler.js";
import { useInsightPlaceholderDropHandler } from "./useInsightPlaceholderDropHandler.js";
import { useKpiPlaceholderDropHandler } from "./useKpiPlaceholderDropHandler.js";
import { useMoveWidgetDropHandler } from "./useMoveWidgetHandler.js";
import { useRichTextPlaceholderDropHandler } from "./useRichTextPlaceholderDropHandler.js";
import { useVisualizationSwitcherPlaceholderDropHandler } from "./useVisualizationSwitcherPlaceholderDropHandler.js";
import { WidgetDropZone } from "./WidgetDropZone.js";
import { getItemIndex, getSectionIndex } from "../../../../_staging/layout/coordinates.js";
import { getDashboardLayoutItemHeightForGrid } from "../../../../_staging/layout/sizing.js";
import {
    selectDraggingWidgetTargetLayoutPath,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model/index.js";
import {
    BaseDraggableLayoutItem,
    isInsightDraggableItem,
    isInsightDraggableListItem,
    isInsightPlaceholderDraggableItem,
    isKpiDraggableItem,
    isKpiPlaceholderDraggableItem,
    isRichTextDraggableItem,
    isRichTextDraggableListItem,
    isVisualizationSwitcherDraggableItem,
    isVisualizationSwitcherDraggableListItem,
    useDashboardDrop,
} from "../../../dragAndDrop/index.js";

export type WidgetDropZoneColumnProps = {
    screen: ScreenSize;
    sectionIndex: number;
    itemIndex: number;
    isLastInSection?: boolean;
};

export function WidgetDropZoneColumn(props: WidgetDropZoneColumnProps) {
    const { sectionIndex, itemIndex, isLastInSection = false } = props;

    const dropzoneCoordinates = useDashboardSelector(selectDraggingWidgetTargetLayoutPath);

    const handleInsightListItemDrop = useInsightListItemDropHandler(sectionIndex, itemIndex);
    const handleInsightPlaceholderDrop = useInsightPlaceholderDropHandler(sectionIndex, itemIndex);
    const handleKpiPlaceholderDrop = useKpiPlaceholderDropHandler(sectionIndex, itemIndex);
    const handleRichTextPlaceholderDrop = useRichTextPlaceholderDropHandler(sectionIndex, itemIndex);
    const handleVisualizationSwitcherPlaceholderDrop = useVisualizationSwitcherPlaceholderDropHandler(
        sectionIndex,
        itemIndex,
    );
    const handleWidgetDrop = useMoveWidgetDropHandler(sectionIndex, itemIndex);

    const dispatch = useDashboardDispatch();

    const [collectedProps, dropRef] = useDashboardDrop(
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
            dispatch,
            handleInsightListItemDrop,
            handleInsightPlaceholderDrop,
            handleKpiPlaceholderDrop,
            handleVisualizationSwitcherPlaceholderDrop,
            handleRichTextPlaceholderDrop,
            handleWidgetDrop,
        ],
    );

    const showDropZone = useMemo(
        () =>
            dropzoneCoordinates !== undefined &&
            getSectionIndex(dropzoneCoordinates) === sectionIndex &&
            getItemIndex(dropzoneCoordinates) === itemIndex,

        [dropzoneCoordinates, itemIndex, sectionIndex],
    );

    if (!showDropZone) {
        return null;
    }

    if (!collectedProps?.item) {
        return null;
    }

    const size = (collectedProps.item as BaseDraggableLayoutItem).size;

    return (
        <Col
            xl={size.gridWidth}
            lg={size.gridWidth}
            md={size.gridWidth}
            sm={size.gridWidth}
            xs={size.gridWidth}
            className={cx("gd-fluidlayout-column", "gd-fluidlayout-column-dropzone", "s-fluid-layout-column")}
            style={{
                minHeight: getDashboardLayoutItemHeightForGrid(size.gridHeight),
            }}
        >
            <WidgetDropZone
                isLastInSection={isLastInSection}
                sectionIndex={sectionIndex}
                itemIndex={itemIndex}
                dropRef={dropRef}
            />
        </Col>
    );
}
