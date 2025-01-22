// (C) 2007-2025 GoodData Corporation
import cx from "classnames";
import React from "react";

import { renderModeAware } from "../../componentDefinition/index.js";
import { isCustomWidgetBase } from "../../../model/index.js";
import { RowEndHotspot } from "../dragAndDrop/draggableWidget/RowEndHotspot.js";

import { DashboardLayoutItemViewRenderer } from "./DashboardLayoutItemViewRenderer.js";
import { IDashboardLayoutItemRenderer } from "./interfaces.js";
import { useIsDraggingCurrentItem } from "../dragAndDrop/draggableWidget/useIsDraggingCurrentItem.js";

const DashboardLayoutItemEditRenderer: IDashboardLayoutItemRenderer<unknown> = (props) => {
    const { item, children, rowIndex } = props;
    const isDraggingCurrentItem = useIsDraggingCurrentItem(item.index());
    const isCustomWidget = isCustomWidgetBase(item.widget());

    return (
        <>
            <DashboardLayoutItemViewRenderer
                {...props}
                className={cx({
                    "current-dragging-item": isDraggingCurrentItem,
                })}
            >
                {children}
            </DashboardLayoutItemViewRenderer>
            {isCustomWidget ? null : <RowEndHotspot item={item} rowIndex={rowIndex} />}
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
