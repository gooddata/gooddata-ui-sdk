// (C) 2019-2022 GoodData Corporation
import { IWidget, ScreenSize } from "@gooddata/sdk-model";
import React, { useEffect, useMemo, useState } from "react";
import { useDashboardDrag } from "../useDashboardDrag";

import { WidthResizer } from "./WidthResizer";
import { useDashboardDispatch, useDashboardSelector, resizeWidth } from "../../../model";
import { useResizeWidthItemStatus, useResizeHandlers } from "../LayoutResizeContext";
import { selectInsightsMap } from "../../../model/store/insights/insightsSelectors";
import { IDashboardLayoutItemFacade } from "../../../_staging/dashboard/fluidLayout/facade/interfaces";
import { getSizeAndXCoords } from "../DragLayerPreview/WidthResizerDragPreview";
import { getMinWidth } from "../../../model/layout";
import { getDashboardLayoutItemMaxGridWidth } from "../../layout/DefaultDashboardLayoutRenderer/utils/sizing";

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
    const { resizeStart, resizeEnd } = useResizeHandlers();

    const widget = useMemo(() => item.widget() as IWidget, [item]);
    const widgetIdentifier = widget.identifier;
    const { isWidthResizing, isActive } = useResizeWidthItemStatus(widgetIdentifier);

    const [isResizerVisible, setResizerVisibility] = useState<boolean>(false);
    const onMouseEnter = () => setResizerVisibility(true);
    const onMouseLeave = () => setResizerVisibility(false);

    const sectionIndex = item.section().index();
    const itemIndex = item.index();

    const currentWidth = item.sizeForScreen(screen)!.gridWidth;
    const minLimit = getMinWidth(widget, insightsMap);
    const maxLimit = getDashboardLayoutItemMaxGridWidth(item, "xl");

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
                const { limitedSize } = getSizeAndXCoords(
                    dragItem,
                    monitor.getInitialClientOffset()!.x,
                    monitor.getDifferenceFromInitialOffset()!.x,
                    document.documentElement.scrollLeft,
                );

                dispatch(resizeWidth(sectionIndex, itemIndex, limitedSize));
                setResizerVisibility(false);
            },
        },

        [widget, insightsMap],
    );

    useEffect(() => {
        if (isDragging) {
            resizeStart("width", [widgetIdentifier], getLayoutDimensions);
        } else {
            resizeEnd();
        }
    }, [isDragging]);

    const isThisResizing = isWidthResizing && isActive;

    const showHotspot = !isDragging || isWidthResizing;
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
                {showResizer && <WidthResizer status={status} />}
            </div>
        </div>
    );
}
