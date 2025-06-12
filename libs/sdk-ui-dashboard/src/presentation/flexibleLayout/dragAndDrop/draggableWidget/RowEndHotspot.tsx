// (C) 2007-2025 GoodData Corporation
import { IDashboardWidget } from "@gooddata/sdk-model";
import cx from "classnames";
import React from "react";

import { selectIsInEditMode, useDashboardSelector } from "../../../../model/index.js";
import { IDashboardLayoutItemFacade } from "../../../../_staging/dashboard/flexibleLayout/index.js";

import { Hotspot } from "./Hotspot.js";
import { updateItem } from "../../../../_staging/layout/coordinates.js";
import { WidgetDropZoneColumn } from "./WidgetDropZoneColumn.js";
import { useScreenSize } from "../../../dashboard/components/DashboardScreenSizeContext.js";
import { GridLayoutElement } from "../../DefaultDashboardLayoutRenderer/GridLayoutElement.js";
import { getRemainingWidthInRow } from "../../rowEndHotspotHelper.js";

export type RowEndHotspotProps<TWidget = IDashboardWidget> = {
    item: IDashboardLayoutItemFacade<TWidget>;
    rowIndex: number;
};

export const RowEndHotspot = (props: RowEndHotspotProps<unknown>) => {
    const { item, rowIndex } = props;

    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const screen = useScreenSize();
    const layoutPath = item.index();
    const isLastInRow = item.isLastInRow(screen);
    const showEndingHotspot = (item.isLastInSection() || isLastInRow) && isInEditMode;

    if (!showEndingHotspot) {
        return null;
    }

    const layoutPathForEndHotspot = updateItem(
        layoutPath,
        layoutPath[layoutPath.length - 1].sectionIndex,
        layoutPath[layoutPath.length - 1].itemIndex + 1,
    ); // increment item index manually as end hotspot is rendered as prev type

    const remainingRowGridWidth = getRemainingWidthInRow(item, screen, rowIndex);
    const isDropZoneVisible = shouldShowRowEndDropZone(remainingRowGridWidth);

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
                    },
                )}
            >
                {isDropZoneVisible ? (
                    <WidgetDropZoneColumn
                        layoutPath={layoutPathForEndHotspot}
                        isLastInSection={true}
                        gridWidthOverride={remainingRowGridWidth}
                    />
                ) : null}
                <Hotspot
                    dropZoneType="prev"
                    isEndingHotspot
                    layoutPath={layoutPathForEndHotspot}
                    hideBorder={isDropZoneVisible || isLastInRow}
                />
            </GridLayoutElement>
        </>
    );
};

export const shouldShowRowEndDropZone = (remainingGridWidth: number) => remainingGridWidth > 0;
