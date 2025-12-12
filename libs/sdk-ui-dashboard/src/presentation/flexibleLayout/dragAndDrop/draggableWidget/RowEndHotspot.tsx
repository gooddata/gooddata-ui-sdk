// (C) 2007-2025 GoodData Corporation

import { type CSSProperties, useMemo } from "react";

import cx from "classnames";

import { type IDashboardWidget } from "@gooddata/sdk-model";

import { Hotspot } from "./Hotspot.js";
import { WidgetDropZoneColumn } from "./WidgetDropZoneColumn.js";
import {
    DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT,
    type IDashboardLayoutItemFacade,
} from "../../../../_staging/dashboard/flexibleLayout/index.js";
import { getLayoutConfiguration } from "../../../../_staging/dashboard/flexibleLayout/layoutConfiguration.js";
import { updateItem } from "../../../../_staging/layout/coordinates.js";
import { getDashboardLayoutItemHeight } from "../../../../_staging/layout/sizing.js";
import {
    type ExtendedDashboardWidget,
    isCustomWidget,
    selectDraggingWidgetSource,
    selectSettings,
    useDashboardSelector,
} from "../../../../model/index.js";
import { useDashboardItemPathAndSize } from "../../../dashboard/components/DashboardItemPathAndSizeContext.js";
import { useScreenSize } from "../../../dashboard/components/DashboardScreenSizeContext.js";
import { useIsDraggingWidget } from "../../../dragAndDrop/index.js";
import { GridLayoutElement } from "../../DefaultDashboardLayoutRenderer/GridLayoutElement.js";
import { getRemainingHeightInColumn, getRemainingWidthInRow } from "../../rowEndHotspotHelper.js";

const MINIMUM_DROPZONE_WIDTH_TO_RENDER_TEXT = 2;
const MINIMUM_DROPZONE_HEIGHT_TO_RENDER_TEXT = 7;

export const useShouldShowRowEndHotspot = (
    item: IDashboardLayoutItemFacade<ExtendedDashboardWidget | unknown>,
    rowIndex: number,
) => {
    const screen = useScreenSize();
    const settings = useDashboardSelector(selectSettings);
    const { layoutItem: parentLayoutItem } = useDashboardItemPathAndSize();
    const { direction } = getLayoutConfiguration(item.section().layout().raw());
    const draggedItem = useDashboardSelector(selectDraggingWidgetSource);

    if (direction === "column") {
        const parentLayoutItemGridWidth =
            item.section().layout().size()?.gridWidth ?? DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT;
        const remainingHeightInColumn = getRemainingHeightInColumn(item, screen, parentLayoutItem, settings);
        return {
            // Column dropzone is styled to have at least 40 px; therefore, we should not show it when there
            // is no space for it. If there is less space, a single line drop zone is rendered instead.
            enableRowEndHotspot: item.isLastInSection() && remainingHeightInColumn > 1,
            gridWidth: parentLayoutItemGridWidth,
            gridHeight: remainingHeightInColumn,
            hideDropzoneText: remainingHeightInColumn < MINIMUM_DROPZONE_HEIGHT_TO_RENDER_TEXT,
        };
    } else {
        const remainingGridWidthInRow = isCustomWidget(item.widget())
            ? 0
            : getRemainingWidthInRow(item, screen, rowIndex, draggedItem?.layoutPath);
        const rowGridHeight = item.size()[screen]?.gridHeight ?? 0;
        return {
            enableRowEndHotspot: item.isLastInRow(screen) && remainingGridWidthInRow > 0,
            gridWidth: remainingGridWidthInRow,
            gridHeight: rowGridHeight,
            hideDropzoneText: remainingGridWidthInRow < MINIMUM_DROPZONE_WIDTH_TO_RENDER_TEXT,
        };
    }
};

export type RowEndHotspotProps<TWidget = IDashboardWidget> = {
    item: IDashboardLayoutItemFacade<TWidget>;
    rowIndex: number;
};

export function RowEndHotspot({ item, rowIndex }: RowEndHotspotProps<ExtendedDashboardWidget | unknown>) {
    const isDraggingWidget = useIsDraggingWidget();
    const { enableRowEndHotspot, gridWidth, gridHeight, hideDropzoneText } = useShouldShowRowEndHotspot(
        item,
        rowIndex,
    );
    const { direction } = getLayoutConfiguration(item.section().layout().raw());

    const layoutItemSize = useMemo(() => {
        const gridHeightProp = gridHeight > 0 ? { gridHeight: gridHeight } : {};
        return {
            xl: {
                gridWidth,
                ...gridHeightProp,
            },
        };
    }, [gridWidth, gridHeight]);

    const layoutPathForEndHotspot = useMemo(() => {
        const layoutPath = item.index();
        return updateItem(
            layoutPath,
            layoutPath[layoutPath.length - 1].sectionIndex,
            layoutPath[layoutPath.length - 1].itemIndex + 1,
        ); // increment item index manually as end hotspot is rendered as prev type
    }, [item]);

    const style: CSSProperties = useMemo(() => {
        const computedHeight = getDashboardLayoutItemHeight(layoutItemSize.xl);
        return computedHeight === undefined ? {} : { height: computedHeight };
    }, [layoutItemSize]);

    if (!enableRowEndHotspot || !isDraggingWidget) {
        return null;
    }

    return (
        <>
            <GridLayoutElement
                type="item"
                layoutItemSize={layoutItemSize}
                className={cx(
                    "gd-fluidlayout-column",
                    "gd-fluidlayout-column-dropzone",
                    "s-fluid-layout-column",
                    "gd-fluidlayout-column-row-end-hotspot",
                    {
                        "gd-fluidlayout-column-dropzone__text--hidden": hideDropzoneText,
                        "gd-first-container-row-dropzone": rowIndex === 0,
                        "gd-fluidlayout-column-row-end-hotspot--direction-row": direction === "row",
                        "gd-fluidlayout-column-row-end-hotspot--direction-column": direction === "column",
                        [`s-fluid-layout-column-height-${gridHeight}`]: gridHeight > 0,
                    },
                )}
                style={style}
            >
                <WidgetDropZoneColumn
                    layoutPath={layoutPathForEndHotspot}
                    gridWidthOverride={gridWidth}
                    gridHeightOverride={gridHeight}
                    isLastInSection
                />
                <Hotspot
                    dropZoneType="prev"
                    direction={direction}
                    layoutPath={layoutPathForEndHotspot}
                    isEndingHotspot
                    hideDropTarget
                />
            </GridLayoutElement>
        </>
    );
}
