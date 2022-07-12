// (C) 2021-2022 GoodData Corporation
import React, { useEffect, useState } from "react";
import { useDashboardDrag } from "../../dragAndDrop/useDashboardDrag";

import { IWidget, ScreenSize } from "@gooddata/sdk-model";
import { useDashboardDispatch, useDashboardSelector } from "../../../model/react/DashboardStoreProvider";
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
import { useResizeContext } from "../../dragAndDrop/LayoutResizeContext";
import { getMaxHeight, getMinHeight } from "../../../model/layout/sizing";

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
    const widgets = items.map((item) => item.widget() as IWidget);
    const widgetIdentifiers = widgets.map((widget) => widget.identifier);

    const [{ isDragging }, dragRef] = useDashboardDrag({
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
            const { sectionIndex, itemIndexes, widgetHeights, initialScrollTop, minLimit, maxLimit } = item;
            const newHeightGR = getNewHeightGR(
                widgetHeights,
                monitor.getDifferenceFromInitialOffset()?.y || 0,
                document.documentElement.scrollTop,
                initialScrollTop,
            );
            console.log(
                "getNewHeightGR",
                widgetHeights,
                monitor.getDifferenceFromInitialOffset()?.y || 0,
                document.documentElement.scrollTop,
                initialScrollTop,
            );
            console.log("newHeightGR", newHeightGR, minLimit, maxLimit);
            dispatch(resizeHeight(sectionIndex, itemIndexes, newHeightGR));
            resizeEnd();
        },
    });

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
): number {
    const currentWidth = Math.max(...widgetHeights);
    const totalDelta = offsetYPX + (currentScrollTop - initialScrollTop);
    const deltaHeightGR = fluidLayoutDescriptor.toGridHeight(totalDelta);
    return currentWidth + deltaHeightGR;
}

/* 
const heightResizerSource = {
    beginDrag(props: IHeightResizerHotspotPropsNonDnd): IHeightResizerDragItem {
        const { layoutItems, widgets, screen, onHeightResizeStarted, contentRef } = props;
        const objRefs = getDashboardItemsObjRefs(layoutItems);
        const heightsGR = getHeightsGR(
            layoutItems,
            screen,
            contentRef.current.getBoundingClientRect().height,
        );
        onHeightResizeStarted(objRefs);
        const minLimit = getMinHeight(widgets);
        const maxLimit = getMaxHeight(widgets);

        return {
            dndType: ItemTypes.HEIGHT_RESIZER,
            widgetHeights: heightsGR,
            initialScrollTop: document.documentElement.scrollTop,
            minLimit,
            maxLimit,
        };
    },
    endDrag(props: IHeightResizerHotspotPropsNonDnd, monitor: DragSourceMonitor): void {
        const { layoutItems, onHeightResizeFinished } = props;
        const objRefs = getDashboardItemsObjRefs(layoutItems);
        const {
            widgetHeights: widgetHeightsGR,
            initialScrollTop,
            minLimit,
            maxLimit,
        }: IHeightResizerDragItem = monitor.getItem();
        const newHeightGR = getNewHeightGR(
            widgetHeightsGR,
            monitor.getDifferenceFromInitialOffset().y,
            document.documentElement.scrollTop,
            initialScrollTop,
        );
        const newLimitedHeightGR = getLimitedHeightGR(newHeightGR, minLimit, maxLimit);

        onHeightResizeFinished(objRefs, newLimitedHeightGR);
    },
};

function collect(connect: DragSourceConnector) {
    return {
        connectDragSource: connect.dragSource(),
    };
}

const mapStateToProps = (
    appState: AppState,
    props: IHeightResizerHotspotOwnProps,
): IHeightResizerHotspotStateProps => {
    const objRefs = getDashboardItemsObjRefs(props.layoutItems);
    const areWidgetsResizing = areWidgetsInResizingRow(appState, objRefs);
    return {
        areWidgetsResizing,
        isColumnResizing: isResizingColumn(appState),
        isOtherRowResizing: isResizingRow(appState) && !areWidgetsResizing,
        widgets: getWidgetsByRefs(appState, objRefs),
    };
};

export const HeightResizerHotspotWithDnD = DragSource<
    IHeightResizerHotspotPropsNonDnd,
    IHeightResizerHotspotDndProps,
    IHeightResizerDragItem
>(
    ItemTypes.HEIGHT_RESIZER,
    heightResizerSource,
    collect,
)(HeightResizerHotspot);

export default connect<
    IHeightResizerHotspotStateProps,
    IHeightResizerHotspotDispatchProps,
    IHeightResizerHotspotOwnProps
>(mapStateToProps)(HeightResizerHotspotWithDnD);
 */
