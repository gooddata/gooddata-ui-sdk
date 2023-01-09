// (C) 2007-2023 GoodData Corporation
import cx from "classnames";
import React from "react";
import { ILayoutCoordinates } from "../../../types";
import { IDashboardLayoutItemFacade } from "../../../_staging/dashboard/fluidLayout/facade/interfaces";
import { RowEndHotspot, WidgetDropZoneColumn, useIsDraggingCurrentItem } from "../../dragAndDrop";
import { DashboardLayoutItemViewRenderer } from "./DashboardLayoutItemViewRenderer";
import { IDashboardLayoutItemRenderer } from "./interfaces";
import { renderModeAware } from "../../componentDefinition";
import { isCustomWidgetBase } from "../../../model";

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

    const isCustomWidget = isCustomWidgetBase(item.widget());

    return (
        <>
            {isCustomWidget ? null : (
                <WidgetDropZoneColumn screen={screen} sectionIndex={sectionIndex} itemIndex={itemIndex} />
            )}
            <DashboardLayoutItemViewRenderer
                {...props}
                className={cx({
                    "current-dragging-item": isDraggingCurrentItem,
                })}
            >
                {children}
            </DashboardLayoutItemViewRenderer>
            {isCustomWidget ? null : <RowEndHotspot item={item} screen={screen} />}
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
