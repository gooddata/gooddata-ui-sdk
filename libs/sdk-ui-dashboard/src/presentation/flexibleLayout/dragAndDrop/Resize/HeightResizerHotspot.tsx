// (C) 2021-2026 GoodData Corporation

import { type Ref, useEffect, useMemo, useState } from "react";

import cx from "classnames";
import { isEmpty, isEqual } from "lodash-es";

import { type IInsight, type ISettings, type IWidget, type ScreenSize } from "@gooddata/sdk-model";
import { INSIGHT_WIDGET_SIZE_INFO_DEFAULT, fluidLayoutDescriptor } from "@gooddata/sdk-ui-ext";

import { HeightResizer } from "./HeightResizer.js";
import {
    type IDashboardLayoutItemFacade,
    type IDashboardLayoutSectionFacade,
} from "../../../../_staging/dashboard/flexibleLayout/facade/interfaces.js";
import { getItemIndex } from "../../../../_staging/layout/coordinates.js";
import {
    calculateWidgetMinHeight,
    determineWidthForScreen,
    getMaxHeight,
    getMinHeight,
} from "../../../../_staging/layout/sizing.js";
import { type ObjRefMap } from "../../../../_staging/metadata/objRefMap.js";
import { resizeNestedLayoutItemsHeight } from "../../../../model/commands/layout.js";
import {
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model/react/DashboardStoreProvider.js";
import { selectSettings } from "../../../../model/store/config/configSelectors.js";
import { selectInsightsMap } from "../../../../model/store/insights/insightsSelectors.js";
import { type ExtendedDashboardWidget, isCustomWidgetBase } from "../../../../model/types/layoutTypes.js";
import { useDashboardItemPathAndSize } from "../../../dashboard/components/DashboardItemPathAndSizeContext.js";
import { useScreenSize } from "../../../dashboard/components/DashboardScreenSizeContext.js";
import { HoveredWidgetContext } from "../../../dragAndDrop/HoveredWidgetContext.js";
import { useResizeContext } from "../../../dragAndDrop/LayoutResizeContext.js";
import { useDashboardDrag } from "../../../dragAndDrop/useDashboardDrag.js";
import { DEFAULT_WIDTH_RESIZER_HEIGHT } from "../../constants.js";

export type HeightResizerHotspotProps = {
    section: IDashboardLayoutSectionFacade<ExtendedDashboardWidget>;
    items: IDashboardLayoutItemFacade<ExtendedDashboardWidget>[];
    getLayoutDimensions: () => DOMRect;
};

export function HeightResizerHotspot({ section, items, getLayoutDimensions }: HeightResizerHotspotProps) {
    const dispatch = useDashboardDispatch();
    const insightsMap = useDashboardSelector(selectInsightsMap);
    const settings = useDashboardSelector(selectSettings);

    const screen = useScreenSize();
    const { layoutItemSize } = useDashboardItemPathAndSize();
    const { resizeDirection, resizeItemIdentifiers, resizeStart, resizeEnd, getScrollCorrection } =
        useResizeContext();
    const widgets = useMemo(() => items.map((item) => item.widget() as IWidget), [items]);
    const layoutItems = useMemo(() => items.map((item) => item.raw()), [items]);
    const widgetIdentifiers = useMemo(() => widgets.map((widget) => widget.identifier), [widgets]);
    const customWidgetsRestrictions = useMemo(() => getCustomWidgetRestrictions(items), [items]);

    const isAnyWidgetHovered = HoveredWidgetContext.useContextStore((ctx) =>
        widgets.some((widget) => ctx.isHovered(widget.ref, ctx.hoveredWidgets)),
    );

    const gridWidth = determineWidthForScreen(screen, layoutItemSize);

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
                    sectionPath: section.index(),
                    sectionIndex: -1, // only for type compatibility reasons, will not be used
                    itemIndexes: items.map((item) => getItemIndex(item.index())),
                    initialLayoutDimensions,
                    widgetHeights: heightsGR,
                    minLimit,
                    maxLimit,
                };
            },
            dragEnd: (item, monitor) => {
                const scrollCorrection = getScrollCorrection();

                const { sectionPath, itemIndexes, widgetHeights } = item;
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

                dispatch(resizeNestedLayoutItemsHeight(sectionPath, itemIndexes, newHeightGR));
                resizeEnd();
            },
        },

        [layoutItems, insightsMap, customWidgetsRestrictions.heightLimit, screen, settings],
    );

    const isItemNested = !!section.index().parent;
    useEffect(() => {
        if (isDragging) {
            resizeStart("height", widgetIdentifiers, isItemNested);
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

    const status = isDragging ? "muted" : isAnyWidgetHovered ? "default" : "active";

    return (
        <div
            className={cx(
                "dash-height-resizer-container s-dash-height-resizer-container",
                `gd-grid-layout__item--span-${gridWidth}`,
            )}
        >
            {status === "default" ? (
                <div className="dash-height-resizer-hotspot s-dash-height-resizer-hotspot">
                    {<HeightResizer status={status} />}
                </div>
            ) : null}
            {customWidgetsRestrictions.allowHeightResize ? (
                <div
                    ref={dragRef as unknown as Ref<HTMLDivElement> | undefined}
                    className="dash-height-resizer-hotspot s-dash-height-resizer-hotspot"
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
