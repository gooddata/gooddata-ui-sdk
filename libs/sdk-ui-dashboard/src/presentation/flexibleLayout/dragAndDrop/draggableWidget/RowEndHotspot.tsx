// (C) 2007-2025 GoodData Corporation
import { IDashboardWidget } from "@gooddata/sdk-model";
import cx from "classnames";
import React, { useMemo } from "react";

import { isCustomWidget, ExtendedDashboardWidget } from "../../../../model/index.js";
import {
    IDashboardLayoutItemFacade,
    DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT,
} from "../../../../_staging/dashboard/flexibleLayout/index.js";
import { updateItem } from "../../../../_staging/layout/coordinates.js";
import { useScreenSize } from "../../../dashboard/components/DashboardScreenSizeContext.js";
import { GridLayoutElement } from "../../DefaultDashboardLayoutRenderer/GridLayoutElement.js";
import { getRemainingWidthInRow, useRemainingHeightInColumn } from "../../rowEndHotspotHelper.js";
import { getLayoutConfiguration } from "../../../../_staging/dashboard/flexibleLayout/layoutConfiguration.js";
import { getDashboardLayoutItemHeight } from "../../../../_staging/layout/sizing.js";

import { WidgetDropZoneColumn } from "./WidgetDropZoneColumn.js";
import { Hotspot } from "./Hotspot.js";

export const useShouldShowRowEndHotspot = (
    item: IDashboardLayoutItemFacade<ExtendedDashboardWidget | unknown>,
    rowIndex: number,
) => {
    const screen = useScreenSize();
    const remainingRowGridWidth = useMemo(
        () => (isCustomWidget(item.widget()) ? 0 : getRemainingWidthInRow(item, screen, rowIndex)),
        [item, screen, rowIndex],
    );

    const { direction } = getLayoutConfiguration(item.section().layout().raw());
    const showEndingHotspot = item.isLastInSection() || item.isLastInRow(screen);
    const isColumnContainer = direction === "column";
    const isLastInColumn = isColumnContainer && item.isLastInSection();
    const isDropZoneVisible = remainingRowGridWidth > 0;
    const hotZoneWidth = isColumnContainer
        ? item.section().layout().size()?.gridWidth ?? DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT
        : remainingRowGridWidth;

    const remainingColumnGridHeight = useRemainingHeightInColumn(item, isLastInColumn);

    return {
        // Column dropzone is styled to have at least 40 px; therefore, we should not show it when there is
        // no space for it. If there is less space, a single line drop zone is rendered instead.
        enableRowEndHotspot:
            (isLastInColumn && remainingColumnGridHeight > 1) || (showEndingHotspot && isDropZoneVisible),
        remainingRowGridWidth: hotZoneWidth,
        remainingColumnGridHeight,
    };
};

export type RowEndHotspotProps<TWidget = IDashboardWidget> = {
    item: IDashboardLayoutItemFacade<TWidget>;
    rowIndex: number;
};

export const RowEndHotspot = ({ item, rowIndex }: RowEndHotspotProps<ExtendedDashboardWidget | unknown>) => {
    const { enableRowEndHotspot, remainingRowGridWidth, remainingColumnGridHeight } =
        useShouldShowRowEndHotspot(item, rowIndex);
    const { direction } = getLayoutConfiguration(item.section().layout().raw());

    // hide text if the dropzone is too small to render the text
    const hideDropzoneText =
        (direction === "row" && remainingRowGridWidth < 2) ||
        (direction === "column" && remainingColumnGridHeight < 7);

    const layoutItemSize = useMemo(() => {
        const gridHeightProp = remainingColumnGridHeight > 0 ? { gridHeight: remainingColumnGridHeight } : {};
        return {
            xl: {
                gridWidth: remainingRowGridWidth,
                ...gridHeightProp,
            },
        };
    }, [remainingRowGridWidth, remainingColumnGridHeight]);

    const layoutPathForEndHotspot = useMemo(() => {
        const layoutPath = item.index();
        return updateItem(
            layoutPath,
            layoutPath[layoutPath.length - 1].sectionIndex,
            layoutPath[layoutPath.length - 1].itemIndex + 1,
        ); // increment item index manually as end hotspot is rendered as prev type
    }, [item]);

    const style: React.CSSProperties = useMemo(() => {
        const computedHeight = getDashboardLayoutItemHeight(layoutItemSize.xl);
        return computedHeight === undefined ? {} : { height: computedHeight };
    }, [layoutItemSize]);

    if (!enableRowEndHotspot) {
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
                        [`s-fluid-layout-column-height-${remainingColumnGridHeight}`]:
                            remainingColumnGridHeight > 0,
                    },
                )}
                style={style}
            >
                <WidgetDropZoneColumn
                    layoutPath={layoutPathForEndHotspot}
                    gridWidthOverride={remainingRowGridWidth}
                    gridHeightOverride={
                        remainingColumnGridHeight === 0 ? undefined : remainingColumnGridHeight
                    }
                    isLastInSection={true}
                />
                <Hotspot
                    dropZoneType="prev"
                    direction={direction}
                    layoutPath={layoutPathForEndHotspot}
                    isEndingHotspot={true}
                    hideDropTarget={true}
                />
            </GridLayoutElement>
        </>
    );
};
