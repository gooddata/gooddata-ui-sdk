// (C) 2007-2026 GoodData Corporation

import { type CSSProperties, useMemo } from "react";

import cx from "classnames";

import { type IDashboardLayoutSizeByScreenSize } from "@gooddata/sdk-model";

import { useDashboardLayoutPlaceholderDropHandler } from "./useDashboardLayoutPlaceholderDropHandler.js";
import { useInsightListItemDropHandler } from "./useInsightListItemDropHandler.js";
import { useInsightPlaceholderDropHandler } from "./useInsightPlaceholderDropHandler.js";
import { useMoveWidgetDropHandler } from "./useMoveWidgetHandler.js";
import { useRichTextPlaceholderDropHandler } from "./useRichTextPlaceholderDropHandler.js";
import { useVisualizationSwitcherPlaceholderDropHandler } from "./useVisualizationSwitcherPlaceholderDropHandler.js";
import { WidgetDropZone } from "./WidgetDropZone.js";
import { areLayoutPathsEqual } from "../../../../_staging/layout/coordinates.js";
import { getDashboardLayoutItemHeight } from "../../../../_staging/layout/sizing.js";
import {
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model/react/DashboardStoreProvider.js";
import {
    selectDraggingWidgetTargetLayoutPath,
    selectDraggingWidgetTriggeringDropZoneType,
} from "../../../../model/store/ui/uiSelectors.js";
import { type ILayoutItemPath } from "../../../../types.js";
import { draggableWidgetDropHandler } from "../../../dragAndDrop/draggableWidget/draggableWidgetDropHandler.js";
import { type BaseDraggableLayoutItem } from "../../../dragAndDrop/types.js";
import { useDashboardDrop } from "../../../dragAndDrop/useDashboardDrop.js";
import { GridLayoutElement } from "../../DefaultDashboardLayoutRenderer/GridLayoutElement.js";

export type WidgetDropZoneColumnProps = {
    layoutPath: ILayoutItemPath;
    isLastInSection?: boolean;
    gridWidthOverride?: number;
    gridHeightOverride?: number;
};

export function WidgetDropZoneColumn({
    layoutPath,
    isLastInSection = false,
    gridWidthOverride,
    gridHeightOverride,
}: WidgetDropZoneColumnProps) {
    const dropzoneCoordinates = useDashboardSelector(selectDraggingWidgetTargetLayoutPath);
    const dropzoneTriggerType = useDashboardSelector(selectDraggingWidgetTriggeringDropZoneType);

    const handleInsightListItemDrop = useInsightListItemDropHandler(layoutPath);
    const handleInsightPlaceholderDrop = useInsightPlaceholderDropHandler(layoutPath);
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
            handleVisualizationSwitcherPlaceholderDrop,
            handleRichTextPlaceholderDrop,
            handleWidgetDrop,
            handleDashboardLayoutPlaceholderDrop,
        ],
    );

    const showDropZone = useMemo(
        // show row end dropzone only when triggered by the "next" dropzone; otherwise it would render
        // also on the previous row, causing unintended layout items reshuffles
        () => dropzoneTriggerType === "next" && areLayoutPathsEqual(dropzoneCoordinates, layoutPath),
        [dropzoneCoordinates, layoutPath, dropzoneTriggerType],
    );
    if (!showDropZone) {
        return null;
    }

    if (!collectedProps?.item || !collectedProps.canDrop) {
        return null;
    }

    const { gridWidth = 12, gridHeight } = (collectedProps.item as BaseDraggableLayoutItem).size;

    const usedWidth = gridWidthOverride ?? gridWidth;
    const usedHeight = gridHeightOverride ?? gridHeight;

    const gridHeightProp = usedHeight === undefined ? {} : { gridHeight: usedHeight };
    const computedHeight = getDashboardLayoutItemHeight({ gridWidth: usedWidth, ...gridHeightProp });
    const style: CSSProperties = computedHeight === undefined ? {} : { height: computedHeight };
    const classNames = cx(
        "gd-fluidlayout-column",
        "gd-fluidlayout-column-dropzone",
        "s-fluid-layout-column",
        {
            [`s-fluid-layout-column-height-${usedHeight}`]: !(
                usedHeight === null || usedHeight === undefined
            ),
        },
    );
    const layoutItemSize: IDashboardLayoutSizeByScreenSize = {
        xl: { gridWidth: usedWidth, gridHeight: usedHeight },
    };
    return (
        <GridLayoutElement type="item" layoutItemSize={layoutItemSize} className={classNames} style={style}>
            <WidgetDropZone isLastInSection={isLastInSection} layoutPath={layoutPath} dropRef={dropRef} />
        </GridLayoutElement>
    );
}
