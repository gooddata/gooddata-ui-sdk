// (C) 2007-2022 GoodData Corporation
import cx from "classnames";
import React from "react";
import { ILayoutCoordinates } from "../../../types";
import { IDashboardLayoutItemFacade } from "../../../_staging/dashboard/fluidLayout/facade/interfaces";
import { RowEndHotspot, WidgetDropZoneColumn, useIsDraggingCurrentItem } from "../../dragAndDrop";
import { DashboardLayoutItemViewRenderer } from "./DashboardLayoutItemViewRenderer";
import { IDashboardLayoutItemRenderer } from "./interfaces";
import { renderModeAware } from "../../componentDefinition";

function getLayoutCoordinates(item: IDashboardLayoutItemFacade<unknown>): ILayoutCoordinates {
    return {
        sectionIndex: item.section()?.index(),
        itemIndex: item.index(),
    };
}

const DashboardLayoutItemEditRenderer: IDashboardLayoutItemRenderer<unknown> = (props) => {
    const { item, screen, children } = props;

    const { sectionIndex, itemIndex } = getLayoutCoordinates(item);

    const isDraggingCurrentItem = useIsDraggingCurrentItem(sectionIndex, itemIndex);

    return (
        <>
            <WidgetDropZoneColumn screen={screen} sectionIndex={sectionIndex} itemIndex={itemIndex} />
            <DashboardLayoutItemViewRenderer
                {...props}
                className={cx({
                    "current-dragging-item": isDraggingCurrentItem,
                })}
            >
                {children}
            </DashboardLayoutItemViewRenderer>
            <RowEndHotspot item={item} screen={screen} />
        </>
    );
};

/**
 * @internal
 */
export const DashboardLayoutItemRenderer = renderModeAware<IDashboardLayoutItemRenderer<unknown>>({
    view: DashboardLayoutItemViewRenderer,
    edit: DashboardLayoutItemEditRenderer,
}) as IDashboardLayoutItemRenderer<unknown>;
