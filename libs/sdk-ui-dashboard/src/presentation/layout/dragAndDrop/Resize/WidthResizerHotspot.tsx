// (C) 2019-2025 GoodData Corporation
import { IWidget, ScreenSize } from "@gooddata/sdk-model";
import React, { useEffect, useMemo, useState } from "react";

import { WidthResizer } from "./WidthResizer.js";
import { IDashboardLayoutItemFacade } from "../../../../_staging/dashboard/legacyFluidLayout/index.js";
import {
    useDashboardDispatch,
    useDashboardSelector,
    selectInsightsMap,
    resizeWidth,
    selectSettings,
} from "../../../../model/index.js";
import { useResizeHandlers, useResizeWidthItemStatus, useDashboardDrag } from "../../../dragAndDrop/index.js";
import { getMinWidth } from "../../../../_staging/layout/sizing.js";
import { getDashboardLayoutItemMaxGridWidth } from "../../DefaultDashboardLayoutRenderer/index.js";
import { getSizeAndXCoords } from "../../../flexibleLayout/dragAndDrop/DragLayerPreview/WidthResizerDragPreview.js";

export type WidthResizerHotspotProps = {
    item: IDashboardLayoutItemFacade<unknown>;
    screen: ScreenSize;
    getGridColumnHeightInPx: () => number;
    getGridColumnWidth: () => number;
    getLayoutDimensions: () => DOMRect;
};

export function WidthResizerHotspot({
    item,
    screen,
    getGridColumnWidth,
    getGridColumnHeightInPx,
    getLayoutDimensions,
}: WidthResizerHotspotProps) {
    const dispatch = useDashboardDispatch();
    const insightsMap = useDashboardSelector(selectInsightsMap);
    const settings = useDashboardSelector(selectSettings);
    const { resizeStart, resizeEnd, getScrollCorrection } = useResizeHandlers();

    const widget = useMemo(() => item.widget() as IWidget, [item]);
    const widgetIdentifier = widget.identifier;
    const { isWidthResizing, isActive } = useResizeWidthItemStatus(widgetIdentifier);

    const [isResizerVisible, setResizerVisibility] = useState<boolean>(false);
    const onMouseEnter = () => setResizerVisibility(true);
    const onMouseLeave = () => setResizerVisibility(false);

    const sectionIndex = item.section().index();
    const itemIndex = item.index();

    const currentWidth = item.sizeForScreen(screen)!.gridWidth;
    const minLimit = getMinWidth(widget, insightsMap, screen, settings, "row");
    const maxLimit = getDashboardLayoutItemMaxGridWidth(item, screen);

    const [{ isDragging }, dragRef] = useDashboardDrag(
        {
            dragItem: () => {
                const initialLayoutDimensions = getLayoutDimensions();
                return {
                    type: "internal-width-resizer",
                    sectionIndex,
                    itemIndex,
                    gridColumnHeightInPx: getGridColumnHeightInPx(),
                    gridColumnWidth: getGridColumnWidth(),
                    initialLayoutDimensions,
                    currentWidth,
                    minLimit,
                    maxLimit,
                };
            },
            dragEnd: (dragItem, monitor) => {
                const scrollCorrection = getScrollCorrection();

                const { limitedSize } = getSizeAndXCoords(
                    dragItem,
                    monitor.getInitialClientOffset()!.x,
                    monitor.getDifferenceFromInitialOffset()!.x,
                    scrollCorrection.x,
                );

                dispatch(resizeWidth(sectionIndex, itemIndex, limitedSize));
                setResizerVisibility(false);
            },
        },

        [widget, insightsMap, sectionIndex, itemIndex, currentWidth, minLimit, maxLimit],
    );

    useEffect(() => {
        if (isDragging) {
            resizeStart("width", [widgetIdentifier], false, getLayoutDimensions);
        } else {
            resizeEnd();
        }
    }, [isDragging]);

    const isThisResizing = isWidthResizing && isActive;

    const showHotspot = !isDragging || isWidthResizing || isResizerVisible;
    const showResizer = isResizerVisible || isThisResizing;
    const status = isDragging ? "muted" : "active";

    if (!showHotspot) {
        return null;
    }

    return (
        <div className="dash-width-resizer-container">
            <div
                className="s-dash-width-resizer-hotspot dash-width-resizer-hotspot"
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                ref={dragRef}
            >
                {showResizer ? <WidthResizer status={status} /> : null}
            </div>
        </div>
    );
}
