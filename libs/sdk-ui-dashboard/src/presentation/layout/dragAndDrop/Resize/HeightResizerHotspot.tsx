// (C) 2021-2025 GoodData Corporation
import React, { useEffect, useMemo, useState } from "react";

import isEqual from "lodash/fp/isEqual.js";
import isEmpty from "lodash/isEmpty.js";

import { IInsight, ISettings, IWidget, ScreenSize } from "@gooddata/sdk-model";
import { INSIGHT_WIDGET_SIZE_INFO_DEFAULT, fluidLayoutDescriptor } from "@gooddata/sdk-ui-ext";

import { HeightResizer } from "./HeightResizer.js";
import {
    IDashboardLayoutItemFacade,
    IDashboardLayoutSectionFacade,
} from "../../../../_staging/dashboard/legacyFluidLayout/index.js";
import { calculateWidgetMinHeight, getMaxHeight, getMinHeight } from "../../../../_staging/layout/sizing.js";
import { ObjRefMap } from "../../../../_staging/metadata/objRefMap.js";
import {
    ExtendedDashboardWidget,
    isCustomWidgetBase,
    resizeHeight,
    selectInsightsMap,
    selectSettings,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model/index.js";
import { useDashboardDrag, useResizeContext } from "../../../dragAndDrop/index.js";
import { DEFAULT_WIDTH_RESIZER_HEIGHT } from "../../constants.js";

export type HeightResizerHotspotProps = {
    section: IDashboardLayoutSectionFacade<ExtendedDashboardWidget>;
    items: IDashboardLayoutItemFacade<ExtendedDashboardWidget>[];
    screen: ScreenSize;
    getLayoutDimensions: () => DOMRect;
};

export function HeightResizerHotspot({
    section,
    items,
    screen,
    getLayoutDimensions,
}: HeightResizerHotspotProps) {
    const dispatch = useDashboardDispatch();
    const insightsMap = useDashboardSelector(selectInsightsMap);
    const settings = useDashboardSelector(selectSettings);

    const { resizeDirection, resizeItemIdentifiers, resizeStart, resizeEnd, getScrollCorrection } =
        useResizeContext();
    const widgets = useMemo(() => items.map((item) => item.widget() as IWidget), [items]);
    const layoutItems = useMemo(() => items.map((item) => item.raw()), [items]);
    const widgetIdentifiers = useMemo(() => widgets.map((widget) => widget.identifier), [widgets]);
    const customWidgetsRestrictions = useMemo(() => getCustomWidgetRestrictions(items), [items]);

    const [{ isDragging }, dragRef] = useDashboardDrag(
        {
            dragItem: () => {
                const initialLayoutDimensions = getLayoutDimensions();

                const minLimit = getMinHeight(
                    layoutItems,
                    insightsMap,
                    screen,
                    settings,
                    customWidgetsRestrictions.heightLimit,
                );
                const maxLimit = getMaxHeight(layoutItems, insightsMap, screen, settings);
                const heightsGR = getHeightsGR(items, insightsMap, screen, settings);

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
                const minLimit = getMinHeight(
                    layoutItems,
                    insightsMap,
                    screen,
                    settings,
                    customWidgetsRestrictions.heightLimit,
                );
                const maxLimit = getMaxHeight(layoutItems, insightsMap, screen, settings);
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

        [layoutItems, insightsMap, customWidgetsRestrictions.heightLimit, screen, settings],
    );

    useEffect(() => {
        if (isDragging) {
            resizeStart("height", widgetIdentifiers, false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we want to run this only when isDragging changes
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
            {customWidgetsRestrictions.allowHeightResize ? (
                <div
                    ref={dragRef}
                    className="s-dash-height-resizer-hotspot dash-height-resizer-hotspot"
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                >
                    {shouldRenderResizer ? <HeightResizer status={status} /> : null}
                </div>
            ) : null}
        </div>
    );
}

export function getHeightsGR(
    items: IDashboardLayoutItemFacade<ExtendedDashboardWidget>[],
    insightMap: ObjRefMap<IInsight>,
    screen: ScreenSize,
    settings: ISettings,
) {
    return items.reduce((acc, item) => {
        const currentSize = item.sizeForScreen(screen);
        const widgetMinHeightPX =
            calculateWidgetMinHeight(item.raw(), currentSize, insightMap, settings) ??
            DEFAULT_WIDTH_RESIZER_HEIGHT;
        const curHeightGR = fluidLayoutDescriptor.toGridHeight(widgetMinHeightPX);
        const gridHeight = item.sizeForScreen(screen)?.gridHeight ?? curHeightGR;
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
function getCustomWidgetRestrictions(items: IDashboardLayoutItemFacade<unknown>[]) {
    const customWidgetItems = items.filter((item) => isCustomWidgetBase(item.widget()));

    const heightLimit = customWidgetItems.reduce<number>((minCustomWidgetHeight, item) => {
        const {
            xl: { gridHeight = INSIGHT_WIDGET_SIZE_INFO_DEFAULT.height.default },
        } = item.size() ?? { xl: {} };

        return Math.max(minCustomWidgetHeight, gridHeight);
    }, 0);

    return {
        allowHeightResize: customWidgetItems.length < items.length,
        heightLimit: customWidgetItems.length > 0 ? heightLimit : 0,
    };
}
