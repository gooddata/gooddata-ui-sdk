// (C) 2021-2022 GoodData Corporation
import React, { useEffect, useMemo, useState } from "react";
import { IWidget, ScreenSize } from "@gooddata/sdk-model";
import { fluidLayoutDescriptor } from "@gooddata/sdk-ui-ext";
import isEqual from "lodash/fp/isEqual";
import isEmpty from "lodash/isEmpty";

import { useDashboardDrag } from "../useDashboardDrag";
import { resizeHeight, selectInsightsMap, useDashboardDispatch, useDashboardSelector } from "../../../model";
import { getMaxHeight, getMinHeight } from "../../../_staging/layout/sizing";
import {
    IDashboardLayoutItemFacade,
    IDashboardLayoutSectionFacade,
} from "../../../_staging/dashboard/fluidLayout/facade/interfaces";
import { HeightResizer } from "./HeightResizer";

import { useResizeContext } from "../LayoutResizeContext";

export type HeightResizerHotspotProps = {
    section: IDashboardLayoutSectionFacade<unknown>;
    items: IDashboardLayoutItemFacade<unknown>[];
    screen: ScreenSize;
    getContainerDimensions: () => DOMRect | undefined;
    getLayoutDimensions: () => DOMRect;
};

export function HeightResizerHotspot({
    section,
    items,
    screen,
    getContainerDimensions,
    getLayoutDimensions,
}: HeightResizerHotspotProps) {
    const dispatch = useDashboardDispatch();
    const insightsMap = useDashboardSelector(selectInsightsMap);
    const { resizeDirection, resizeItemIdentifiers, resizeStart, resizeEnd, getScrollCorrection } =
        useResizeContext();
    const widgets = useMemo(() => items.map((item) => item.widget() as IWidget), [items]);
    const widgetIdentifiers = widgets.map((widget) => widget.identifier);

    const [{ isDragging }, dragRef] = useDashboardDrag(
        {
            dragItem: () => {
                const initialLayoutDimensions = getLayoutDimensions();

                const minLimit = getMinHeight(widgets, insightsMap);
                const maxLimit = getMaxHeight(widgets, insightsMap);
                const heightsGR = getHeightsGR(items, screen, getContainerDimensions()?.height ?? 100);

                return {
                    type: "internal-height-resizer",
                    sectionIndex: section.index(),
                    itemIndexes: items.map((item) => item.index()),
                    initialLayoutDimensions,
                    widgetHeights: heightsGR,
                    minLimit,
                    maxLimit,
                };
            },
            dragEnd: (item, monitor) => {
                const scrollCorrection = getScrollCorrection();

                const { sectionIndex, itemIndexes, widgetHeights } = item;
                const minLimit = getMinHeight(widgets, insightsMap);
                const maxLimit = getMaxHeight(widgets, insightsMap);
                const newHeightGR = getNewHeightGR(
                    widgetHeights,
                    monitor.getDifferenceFromInitialOffset()?.y || 0,
                    scrollCorrection.y,
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

    const areWidgetsResizing = resizeDirection !== "none";
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
                {shouldRenderResizer ? <HeightResizer status={status} /> : null}
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
    scrollCorrectionY: number,
    minLimit: number,
    maxLimit: number,
): number {
    const currentWidth = Math.max(...widgetHeights);
    const deltaHeightGR = fluidLayoutDescriptor.toGridHeight(offsetYPX - scrollCorrectionY);

    return Math.min(maxLimit, Math.max(minLimit, currentWidth + deltaHeightGR));
}
