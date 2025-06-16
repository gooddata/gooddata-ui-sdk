// (C) 2007-2025 GoodData Corporation
import { IDashboardWidget } from "@gooddata/sdk-model";
import cx from "classnames";
import React, { useMemo } from "react";

import { isCustomWidget } from "../../../../model/index.js";
import {
    IDashboardLayoutItemFacade,
    DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT,
} from "../../../../_staging/dashboard/flexibleLayout/index.js";
import { updateItem } from "../../../../_staging/layout/coordinates.js";
import { useScreenSize } from "../../../dashboard/components/DashboardScreenSizeContext.js";
import { GridLayoutElement } from "../../DefaultDashboardLayoutRenderer/GridLayoutElement.js";
import { getRemainingWidthInRow } from "../../rowEndHotspotHelper.js";
import { getLayoutConfiguration } from "../../../../_staging/dashboard/flexibleLayout/layoutConfiguration.js";

import { WidgetDropZoneColumn } from "./WidgetDropZoneColumn.js";
import { Hotspot } from "./Hotspot.js";

export const useShouldShowRowEndHotspot = (item: IDashboardLayoutItemFacade<unknown>, rowIndex: number) => {
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

    return {
        enableRowEndHotspot: isLastInColumn || (showEndingHotspot && isDropZoneVisible),
        remainingRowGridWidth: hotZoneWidth,
    };
};

export type RowEndHotspotProps<TWidget = IDashboardWidget> = {
    item: IDashboardLayoutItemFacade<TWidget>;
    rowIndex: number;
};

export const RowEndHotspot = ({ item, rowIndex }: RowEndHotspotProps<unknown>) => {
    const { enableRowEndHotspot, remainingRowGridWidth } = useShouldShowRowEndHotspot(item, rowIndex);
    const { direction } = getLayoutConfiguration(item.section().layout().raw());

    if (!enableRowEndHotspot) {
        return null;
    }

    const layoutPath = item.index();
    const layoutPathForEndHotspot = updateItem(
        layoutPath,
        layoutPath[layoutPath.length - 1].sectionIndex,
        layoutPath[layoutPath.length - 1].itemIndex + 1,
    ); // increment item index manually as end hotspot is rendered as prev type

    return (
        <>
            <GridLayoutElement
                type="item"
                layoutItemSize={{
                    xl: { gridWidth: remainingRowGridWidth },
                    lg: { gridWidth: remainingRowGridWidth },
                    md: { gridWidth: remainingRowGridWidth },
                    sm: { gridWidth: remainingRowGridWidth },
                    xs: { gridWidth: remainingRowGridWidth },
                }}
                className={cx(
                    "gd-fluidlayout-column",
                    "gd-fluidlayout-column-dropzone",
                    "s-fluid-layout-column",
                    "gd-fluidlayout-column-row-end-hotspot",
                    {
                        "gd-fluidlayout-column-dropzone__text--hidden": remainingRowGridWidth < 2,
                        "gd-first-container-row-dropzone": rowIndex === 0,
                        "gd-fluidlayout-column-row-end-hotspot--row": direction === "row",
                        "gd-fluidlayout-column-row-end-hotspot--column": direction === "column",
                    },
                )}
            >
                <WidgetDropZoneColumn
                    layoutPath={layoutPathForEndHotspot}
                    gridWidthOverride={remainingRowGridWidth}
                    isLastInSection={true}
                />
                <Hotspot
                    dropZoneType="prev"
                    layoutPath={layoutPathForEndHotspot}
                    isEndingHotspot={true}
                    hideBorder={true}
                />
            </GridLayoutElement>
        </>
    );
};
