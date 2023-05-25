// (C) 2007-2023 GoodData Corporation
import cx from "classnames";
import React from "react";
import { ILayoutCoordinates } from "../../../types.js";
import { IDashboardLayoutItemFacade } from "../../../_staging/dashboard/fluidLayout/facade/interfaces.js";
import { RowEndHotspot, WidgetDropZoneColumn, useIsDraggingCurrentItem } from "../../dragAndDrop/index.js";
import { DashboardLayoutItemViewRenderer } from "./DashboardLayoutItemViewRenderer.js";
import { IDashboardLayoutItemRenderer } from "./interfaces.js";
import { renderModeAware } from "../../componentDefinition/index.js";
import { isCustomWidgetBase } from "../../../model/index.js";

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
