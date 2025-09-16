// (C) 2019-2025 GoodData Corporation

import { Ref, useEffect, useMemo, useState } from "react";

import cx from "classnames";

import { IDashboardLayoutContainerDirection, IWidget, isDashboardLayout } from "@gooddata/sdk-model";

import { WidthResizer } from "./WidthResizer.js";
import { DASHBOARD_LAYOUT_GRID_SINGLE_COLUMN } from "../../../../_staging/dashboard/flexibleLayout/config.js";
import { IDashboardLayoutItemFacade } from "../../../../_staging/dashboard/flexibleLayout/index.js";
import { getLayoutConfiguration } from "../../../../_staging/dashboard/flexibleLayout/layoutConfiguration.js";
import { getMinWidth } from "../../../../_staging/layout/sizing.js";
import {
    resizeNestedLayoutItemWidth,
    selectInsightsMap,
    selectSettings,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model/index.js";
import { useScreenSize } from "../../../dashboard/components/DashboardScreenSizeContext.js";
import {
    HoveredWidgetContext,
    useDashboardDrag,
    useResizeHandlers,
    useResizeWidthItemStatus,
} from "../../../dragAndDrop/index.js";
import { getDashboardLayoutItemMaxGridWidth } from "../../DefaultDashboardLayoutRenderer/index.js";
import { getSizeAndXCoords } from "../DragLayerPreview/WidthResizerDragPreview.js";

export type WidthResizerHotspotProps = {
    item: IDashboardLayoutItemFacade<unknown>;
    getGridColumnHeightInPx: () => number;
    getGridColumnWidth: () => number;
    getLayoutDimensions: () => DOMRect;
    rowIndex: number;
};

const getItemOrParentDirection = (
    itemFacade: IDashboardLayoutItemFacade<unknown>,
    parentLayoutDirection: IDashboardLayoutContainerDirection,
): IDashboardLayoutContainerDirection => {
    const item = itemFacade.raw();
    if (isDashboardLayout(item.widget)) {
        return getLayoutConfiguration(item.widget).direction;
    }
    return parentLayoutDirection;
};

export function WidthResizerHotspot({
    item,
    getGridColumnWidth,
    getGridColumnHeightInPx,
    getLayoutDimensions,
    rowIndex,
}: WidthResizerHotspotProps) {
    const dispatch = useDashboardDispatch();
    const insightsMap = useDashboardSelector(selectInsightsMap);
    const settings = useDashboardSelector(selectSettings);
    const { resizeStart, resizeEnd, getScrollCorrection } = useResizeHandlers();
    const screen = useScreenSize();

    // we are always interested about parent's direction, otherwise we would hide width resizer on the container itself
    const parentLayoutDirection = getLayoutConfiguration(item.section().layout().raw()).direction;
    // we need either the parent's direction or item's direction in the case when the item is layout to determine min width
    const itemDirection = getItemOrParentDirection(item, parentLayoutDirection);

    const widget = useMemo(() => item.widget() as IWidget, [item]);
    const widgetIdentifier = widget.identifier;
    const { isWidthResizing, isActive } = useResizeWidthItemStatus(widgetIdentifier);
    const isWidgetHovered = HoveredWidgetContext.useContextStore((ctx) =>
        ctx.isHovered(widget.ref, ctx.hoveredWidgets),
    );

    const [isResizerVisible, setResizerVisibility] = useState<boolean>(false);
    const onMouseEnter = () => setResizerVisibility(true);
    const onMouseLeave = () => setResizerVisibility(false);
    const layoutPath = item.index();

    const [{ isDragging }, dragRef] = useDashboardDrag(
        {
            dragItem: () => {
                const currentWidth =
                    item.sizeForScreen(screen)?.gridWidth || DASHBOARD_LAYOUT_GRID_SINGLE_COLUMN;
                const minLimit = getMinWidth(widget, insightsMap, screen, settings, itemDirection);
                const maxLimit = getDashboardLayoutItemMaxGridWidth(item, screen);
                const initialLayoutDimensions = getLayoutDimensions();
                return {
                    type: "internal-width-resizer",
                    layoutPath,
                    sectionIndex: -1, // only for type compatibility reasons, will not be used
                    itemIndex: -1, // only for type compatibility reasons, will not be used
                    gridColumnHeightInPx: getGridColumnHeightInPx(),
                    gridColumnWidth: getGridColumnWidth(),
                    initialLayoutDimensions,
                    currentWidth,
                    minLimit,
                    maxLimit,
                    rowIndex,
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

                dispatch(resizeNestedLayoutItemWidth(layoutPath, limitedSize));
                setResizerVisibility(false);
            },
        },

        [widget, insightsMap, layoutPath, rowIndex, item, screen, itemDirection, settings],
    );

    const isItemNested = layoutPath.length > 1;
    useEffect(() => {
        if (isDragging) {
            resizeStart("width", [widgetIdentifier], isItemNested, getLayoutDimensions);
        } else {
            resizeEnd();
        }
    }, [getLayoutDimensions, isDragging, isItemNested, resizeEnd, resizeStart, widgetIdentifier]);

    const isThisResizing = isWidthResizing && isActive;

    const isColumnContainer = parentLayoutDirection === "column";
    const showHotspot = (!isDragging || isWidthResizing || isResizerVisible) && !isColumnContainer;
    const showResizer = isResizerVisible || isThisResizing || isWidgetHovered;
    const status = isDragging ? "muted" : isWidgetHovered ? "default" : "active";

    if (!showHotspot) {
        return null;
    }

    return (
        <div
            className={cx("dash-width-resizer-container", {
                "gd-first-container-row-widget": rowIndex === 0,
            })}
        >
            <div
                className="dash-width-resizer-hotspot s-dash-width-resizer-hotspot"
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                ref={dragRef as unknown as Ref<HTMLDivElement> | undefined}
            >
                {showResizer ? <WidthResizer status={status} /> : null}
            </div>
        </div>
    );
}
