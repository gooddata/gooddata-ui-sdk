// (C) 2007-2025 GoodData Corporation
import cx from "classnames";
import React, { useMemo } from "react";
import {
    selectDraggingWidgetTargetLayoutPath,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model/index.js";
import { WidgetDropZone } from "./WidgetDropZone.js";
import { useDashboardDrop } from "../../../dragAndDrop/useDashboardDrop.js";
import { useInsightListItemDropHandler } from "./useInsightListItemDropHandler.js";
import { useInsightPlaceholderDropHandler } from "./useInsightPlaceholderDropHandler.js";
import { useKpiPlaceholderDropHandler } from "./useKpiPlaceholderDropHandler.js";
import { useMoveWidgetDropHandler } from "./useMoveWidgetHandler.js";
import { BaseDraggableLayoutItem } from "../../../dragAndDrop/types.js";
import { useRichTextPlaceholderDropHandler } from "./useRichTextPlaceholderDropHandler.js";
import { useVisualizationSwitcherPlaceholderDropHandler } from "./useVisualizationSwitcherPlaceholderDropHandler.js";
import { useDashboardLayoutPlaceholderDropHandler } from "./useDashboardLayoutPlaceholderDropHandler.js";
import { ILayoutItemPath } from "../../../../types.js";
import { areLayoutPathsEqual } from "../../../../_staging/layout/coordinates.js";
import { draggableWidgetDropHandler } from "../../../dragAndDrop/draggableWidget/draggableWidgetDropHandler.js";
import { GridLayoutElement } from "../../DefaultDashboardLayoutRenderer/GridLayoutElement.js";

export type WidgetDropZoneColumnProps = {
    layoutPath: ILayoutItemPath;
    isLastInSection?: boolean;
    gridWidthOverride?: number;
};

export const WidgetDropZoneColumn = (props: WidgetDropZoneColumnProps) => {
    const { layoutPath, isLastInSection = false } = props;

    const dropzoneCoordinates = useDashboardSelector(selectDraggingWidgetTargetLayoutPath);

    const handleInsightListItemDrop = useInsightListItemDropHandler(layoutPath);
    const handleInsightPlaceholderDrop = useInsightPlaceholderDropHandler(layoutPath);
    const handleKpiPlaceholderDrop = useKpiPlaceholderDropHandler(layoutPath);
    const handleRichTextPlaceholderDrop = useRichTextPlaceholderDropHandler(layoutPath);
    const handleVisualizationSwitcherPlaceholderDrop =
        useVisualizationSwitcherPlaceholderDropHandler(layoutPath);
    const handleDashboardLayoutPlaceholderDrop = useDashboardLayoutPlaceholderDropHandler(layoutPath);

    const handleWidgetDrop = useMoveWidgetDropHandler(layoutPath);

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
            "dashboardLayout",
            "dashboardLayoutListItem",
        ],
        {
            drop: (item) => {
                draggableWidgetDropHandler(item, {
                    handleInsightListItemDrop,
                    handleKpiPlaceholderDrop,
                    handleInsightPlaceholderDrop,
                    handleRichTextPlaceholderDrop,
                    handleVisualizationSwitcherPlaceholderDrop,
                    handleDashboardLayoutPlaceholderDrop,
                    handleWidgetDrop,
                });
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
            handleDashboardLayoutPlaceholderDrop,
        ],
    );

    const showDropZone = useMemo(
        () => areLayoutPathsEqual(dropzoneCoordinates, layoutPath),
        [dropzoneCoordinates, layoutPath],
    );

    if (!showDropZone) {
        return null;
    }

    if (!collectedProps?.item || !collectedProps.canDrop) {
        return null;
    }

    const { gridWidth = 12, gridHeight } = (collectedProps.item as BaseDraggableLayoutItem).size;

    const usedWidth = props.gridWidthOverride ?? gridWidth;

    return (
        <GridLayoutElement
            type="item"
            layoutItemSize={{
                xl: { gridWidth: usedWidth, gridHeight },
                lg: { gridWidth: usedWidth, gridHeight },
                md: { gridWidth: usedWidth, gridHeight },
                sm: { gridWidth: usedWidth, gridHeight },
                xs: { gridWidth: usedWidth, gridHeight },
            }}
            className={cx("gd-fluidlayout-column", "gd-fluidlayout-column-dropzone", "s-fluid-layout-column")}
        >
            <WidgetDropZone isLastInSection={isLastInSection} layoutPath={layoutPath} dropRef={dropRef} />
        </GridLayoutElement>
    );
};
