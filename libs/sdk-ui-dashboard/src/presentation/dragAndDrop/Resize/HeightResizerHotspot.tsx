// (C) 2021-2022 GoodData Corporation
import React, { useEffect, useMemo, useState } from "react";
import { useDashboardDrag } from "../useDashboardDrag";

import { IWidget, ScreenSize } from "@gooddata/sdk-model";
import { useDashboardDispatch, useDashboardSelector } from "../../../model/react";
import { selectInsightsMap } from "../../../model/store/insights/insightsSelectors";
import {
    IDashboardLayoutItemFacade,
    IDashboardLayoutSectionFacade,
} from "../../../_staging/dashboard/fluidLayout/facade/interfaces";
import { HeightResizer } from "./HeightResizer";

import { fluidLayoutDescriptor } from "@gooddata/sdk-ui-ext";
import isEqual from "lodash/fp/isEqual";
import isEmpty from "lodash/isEmpty";
import { resizeHeight } from "../../../model";
import { getMaxHeight, getMinHeight } from "../../../model/layout";
import { useResizeContext } from "../LayoutResizeContext";

export type HeightResizerHotspotProps = {
    section: IDashboardLayoutSectionFacade<unknown>;
    items: IDashboardLayoutItemFacade<unknown>[];
    screen: ScreenSize;
    getContainerDimensions: () => DOMRect | undefined;
};

export function HeightResizerHotspot({
    section,
    items,
    screen,
    getContainerDimensions,
}: HeightResizerHotspotProps) {
    const dispatch = useDashboardDispatch();
    const insightsMap = useDashboardSelector(selectInsightsMap);
    const { resizeDirection, resizeItemIdentifiers, resizeStart, resizeEnd } = useResizeContext();
    const widgets = useMemo(() => items.map((item) => item.widget() as IWidget), [items]);
    const widgetIdentifiers = widgets.map((widget) => widget.identifier);

    const [{ isDragging }, dragRef] = useDashboardDrag(
        {
            dragItem: () => {
                const initialScrollTop = document.documentElement.scrollTop;
                const minLimit = getMinHeight(widgets, insightsMap);
                const maxLimit = getMaxHeight(widgets, insightsMap);
                const heightsGR = getHeightsGR(items, screen, getContainerDimensions()?.height ?? 100);

                return {
                    type: "internal-height-resizer",
                    sectionIndex: section.index(),
                    itemIndexes: items.map((item) => item.index()),
                    initialScrollTop,
                    widgetHeights: heightsGR,
                    minLimit,
                    maxLimit,
                };
            },
            dragEnd: (item, monitor) => {
                const { sectionIndex, itemIndexes, widgetHeights, initialScrollTop } = item;
                const minLimit = getMinHeight(widgets, insightsMap);
                const maxLimit = getMaxHeight(widgets, insightsMap);
                const newHeightGR = getNewHeightGR(
                    widgetHeights,
                    monitor.getDifferenceFromInitialOffset()?.y || 0,
                    document.documentElement.scrollTop,
                    initialScrollTop,
                    minLimit,
                    maxLimit,
                );

                dispatch(resizeHeight(sectionIndex, itemIndexes, newHeightGR));
                resizeEnd();
            },
        },

        [widgets, insightsMap],
    );

    useEffect(() => {
        if (isDragging) {
            resizeStart("height", widgetIdentifiers);
        }
    }, [isDragging]);

    const areWidgetsResizing = resizeDirection != "none";
    const isColumnResizing = resizeDirection === "width";
    const isOtherRowResizing =
        !isEmpty(resizeItemIdentifiers) && !isEqual(resizeItemIdentifiers, widgetIdentifiers);

    const [isResizerVisible, setResizerVisibility] = useState<boolean>(false);
    const onMouseEnter = () => setResizerVisibility(true);
    const onMouseLeave = () => setResizerVisibility(false);

    const shouldRenderResizer =
        (areWidgetsResizing || isResizerVisible) && !isColumnResizing && !isOtherRowResizing;
    const status = isDragging ? "muted" : "active";

    return (
        <div className="dash-height-resizer-container s-dash-height-resizer-container">
            <div
                ref={dragRef}
                className="s-dash-height-resizer-hotspot dash-height-resizer-hotspot"
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                {shouldRenderResizer && <HeightResizer status={status} />}
            </div>
        </div>
    );
}

export function getHeightsGR(
    widgets: IDashboardLayoutItemFacade<unknown>[],
    screen: ScreenSize,
    widgetHeightPX: number,
) {
    return widgets.reduce((acc, widget) => {
        const curHeightGR = fluidLayoutDescriptor.toGridHeight(widgetHeightPX);
        const gridHeight = widget.sizeForScreen(screen)?.gridHeight ?? curHeightGR;
        return [...acc, gridHeight];
    }, [] as number[]);
}

export function getNewHeightGR(
    widgetHeights: number[],
    offsetYPX: number,
    currentScrollTop: number,
    initialScrollTop: number,
    minLimit: number,
    maxLimit: number,
): number {
    const currentWidth = Math.max(...widgetHeights);
    const totalDelta = offsetYPX + (currentScrollTop - initialScrollTop);
    const deltaHeightGR = fluidLayoutDescriptor.toGridHeight(totalDelta);

    return Math.min(maxLimit, Math.max(minLimit, currentWidth + deltaHeightGR));
}
