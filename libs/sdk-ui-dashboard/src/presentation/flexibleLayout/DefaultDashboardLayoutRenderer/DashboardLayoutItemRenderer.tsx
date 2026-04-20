// (C) 2007-2026 GoodData Corporation

import cx from "classnames";

import { isCustomWidgetBase } from "../../../model/types/layoutTypes.js";
import { renderModeAware } from "../../componentDefinition/renderModeAware.js";
import { RowEndHotspot } from "../dragAndDrop/draggableWidget/RowEndHotspot.js";
import { useIsDraggingCurrentItem } from "../dragAndDrop/draggableWidget/useIsDraggingCurrentItem.js";
import { DashboardLayoutItemViewRenderer } from "./DashboardLayoutItemViewRenderer.js";
import { type IDashboardLayoutItemRenderProps, type IDashboardLayoutItemRenderer } from "./interfaces.js";

function DashboardLayoutItemEditRenderer(props: IDashboardLayoutItemRenderProps<unknown> & object) {
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
}

/**
 * @internal
 */
export const DashboardLayoutItemRenderer = renderModeAware<IDashboardLayoutItemRenderer<unknown>>({
    view: DashboardLayoutItemViewRenderer,
    edit: DashboardLayoutItemEditRenderer,
}) as IDashboardLayoutItemRenderer<unknown>;
